import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Trash2, Calendar, TrendingUp, AlertTriangle, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Account, PaymentLog } from "@/pages/Index";

interface AccountsSectionProps {
  accounts: Account[];
  bankBalance: number;
  onAccountsChange: (accounts: Account[]) => void;
  onPaymentMade: (payment: PaymentLog) => void;
}

export const AccountsSection: React.FC<AccountsSectionProps> = ({ 
  accounts, 
  bankBalance, 
  onAccountsChange, 
  onPaymentMade 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customPayments, setCustomPayments] = useState<{ [key: string]: string }>({});
  const [editingField, setEditingField] = useState<{ accountId: string; field: string } | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'credit-card' as 'credit-card' | 'loan',
    outstanding: '',
    minPayment: '',
    interestRate: '',
    dueDate: ''
  });

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.outstanding || !newAccount.minPayment) {
      toast.error("Please fill all required fields");
      return;
    }

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      type: newAccount.type,
      outstanding: parseFloat(newAccount.outstanding),
      minPayment: parseFloat(newAccount.minPayment),
      interestRate: parseFloat(newAccount.interestRate) || 0,
      dueDate: newAccount.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    onAccountsChange([...accounts, account]);
    setNewAccount({
      name: '',
      type: 'credit-card',
      outstanding: '',
      minPayment: '',
      interestRate: '',
      dueDate: ''
    });
    setIsAddDialogOpen(false);
    toast.success("Account added successfully!");
  };

  const handleFieldEdit = (accountId: string, field: string, value: string) => {
    setEditingField({ accountId, field });
    setEditValues({ ...editValues, [`${accountId}-${field}`]: value });
  };

  const handleFieldSave = (accountId: string, field: string) => {
    const newValue = editValues[`${accountId}-${field}`];
    if (!newValue) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          [field]: field === 'name' ? newValue : parseFloat(newValue)
        };
      }
      return acc;
    });

    onAccountsChange(updatedAccounts);
    setEditingField(null);
    toast.success("Field updated successfully!");
  };

  const handleFieldCancel = () => {
    setEditingField(null);
  };

  const handlePayment = (accountId: string, amount: number, type: 'minimum' | 'full' | 'custom' | 'emi') => {
    if (amount > bankBalance) {
      toast.error("Insufficient bank balance!");
      return;
    }

    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          outstanding: Math.max(0, acc.outstanding - amount),
          lastPayment: {
            amount,
            date: new Date().toISOString(),
            type
          }
        };
      }
      return acc;
    });

    onAccountsChange(updatedAccounts);

    const payment: PaymentLog = {
      id: Date.now().toString(),
      accountId,
      accountName: account.name,
      amount,
      type,
      date: new Date().toISOString(),
      balanceBefore: bankBalance,
      balanceAfter: bankBalance - amount
    };

    onPaymentMade(payment);
    toast.success(`Payment of ₹${amount.toLocaleString()} made successfully!`);
  };

  const handleDeleteAccount = (accountId: string) => {
    onAccountsChange(accounts.filter(acc => acc.id !== accountId));
    toast.success("Account deleted successfully");
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateBadge = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (days <= 3) return <Badge variant="destructive">Due Soon</Badge>;
    if (days <= 7) return <Badge className="bg-orange-500">Due This Week</Badge>;
    return <Badge variant="secondary">{days} days</Badge>;
  };

  const getSmartTips = (account: Account) => {
    const paymentOptions = [2000, 5000, 10000];
    const tips = [];

    for (const extraAmount of paymentOptions) {
      if (extraAmount > bankBalance * 0.5) continue; // Don't suggest more than 50% of bank balance
      if (extraAmount >= account.outstanding) continue; // Don't suggest more than outstanding

      const currentOutstanding = account.outstanding;
      const newOutstanding = Math.max(0, currentOutstanding - extraAmount);
      
      // Calculate monthly interest rate
      const monthlyRate = (account.interestRate / 100) / 12;
      
      // Calculate current and new monthly interest charges
      const currentMonthlyInterest = currentOutstanding * monthlyRate;
      const newMonthlyInterest = newOutstanding * monthlyRate;
      const interestSaved = currentMonthlyInterest - newMonthlyInterest;

      if (account.type === 'credit-card') {
        const newMinPayment = Math.max(500, newOutstanding * 0.05);
        
        if (interestSaved >= 10) { // Only show if meaningful savings
          tips.push(`💰 Pay ₹${extraAmount.toLocaleString()} extra → Outstanding: ₹${newOutstanding.toLocaleString()} | New min: ₹${newMinPayment.toFixed(0)} | Interest saved: ₹${interestSaved.toFixed(0)}/month`);
        }
      } else {
        // For loans, calculate time savings
        const currentMonths = currentOutstanding > 0 ? Math.log(1 + (currentOutstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate) : 0;
        const newMonths = newOutstanding > 0 ? Math.log(1 + (newOutstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate) : 0;
        const monthsSaved = Math.max(0, currentMonths - newMonths);
        
        if (interestSaved >= 10) { // Only show if meaningful savings
          tips.push(`🏠 Pay ₹${extraAmount.toLocaleString()} extra → Outstanding: ₹${newOutstanding.toLocaleString()} | Months saved: ${monthsSaved.toFixed(1)} | Interest saved: ₹${interestSaved.toFixed(0)}/month`);
        }
      }
    }

    return tips.length > 0 ? tips : [`💡 Consider paying more than minimum to save on interest charges (${account.interestRate}% annual rate)`];
  };

  const renderEditableField = (account: Account, field: keyof Account, displayValue: string, isNumeric = false) => {
    const isEditing = editingField?.accountId === account.id && editingField?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type={isNumeric ? "number" : "text"}
            value={editValues[`${account.id}-${field}`] || ''}
            onChange={(e) => setEditValues({...editValues, [`${account.id}-${field}`]: e.target.value})}
            className="bg-purple-800/50 border-purple-600 text-purple-100 text-sm h-8"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleFieldSave(account.id, field)}
            className="bg-green-600 hover:bg-green-500 text-white h-8 w-8 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            onClick={handleFieldCancel}
            className="bg-red-600 hover:bg-red-500 text-white h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-purple-600/20 p-1 rounded group"
        onClick={() => handleFieldEdit(account.id, field, displayValue)}
      >
        <span>{displayValue}</span>
        <Edit2 className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  return (
    <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <CreditCard className="h-6 w-6 text-purple-300" />
            Accounts ({accounts.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-purple-900 border-purple-600">
              <DialogHeader>
                <DialogTitle className="text-purple-100">Add New Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-purple-200">Account Name</Label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                    placeholder="e.g., HDFC Credit Card"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Type</Label>
                  <Select 
                    value={newAccount.type} 
                    onValueChange={(value: 'credit-card' | 'loan') => setNewAccount({...newAccount, type: value})}
                  >
                    <SelectTrigger className="bg-purple-800/50 border-purple-600 text-purple-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-800 border-purple-600">
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-200">Outstanding Amount</Label>
                  <Input
                    type="number"
                    value={newAccount.outstanding}
                    onChange={(e) => setNewAccount({...newAccount, outstanding: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Min Payment/EMI</Label>
                  <Input
                    type="number"
                    value={newAccount.minPayment}
                    onChange={(e) => setNewAccount({...newAccount, minPayment: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                    placeholder="1250"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Interest Rate (%)</Label>
                  <Input
                    type="number"
                    value={newAccount.interestRate}
                    onChange={(e) => setNewAccount({...newAccount, interestRate: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                    placeholder="42"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Due Date</Label>
                  <Input
                    type="date"
                    value={newAccount.dueDate}
                    onChange={(e) => setNewAccount({...newAccount, dueDate: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                  />
                </div>
                <Button onClick={handleAddAccount} className="w-full bg-purple-600 hover:bg-purple-500">
                  Add Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id} className="bg-purple-700/30 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-purple-100 flex items-center gap-2">
                    {account.name}
                    <Badge variant={account.type === 'credit-card' ? 'default' : 'secondary'}>
                      {account.type === 'credit-card' ? 'Card' : 'Loan'}
                    </Badge>
                    {account.interestRate > 20 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        High Interest
                      </Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-purple-200 text-sm">
                      Due: {new Date(account.dueDate).toLocaleDateString()}
                    </span>
                    {getDueDateBadge(account.dueDate)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-purple-300 text-sm">Outstanding</p>
                  <div className="text-lg font-bold text-red-300">
                    {renderEditableField(account, 'outstanding', `₹${account.outstanding.toLocaleString()}`, true)}
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Min Payment</p>
                  <div className="text-lg font-bold text-yellow-300">
                    {renderEditableField(account, 'minPayment', `₹${account.minPayment.toLocaleString()}`, true)}
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Interest Rate</p>
                  <div className="text-lg font-bold text-orange-300">
                    {renderEditableField(account, 'interestRate', `${account.interestRate}%`, true)}
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Last Payment</p>
                  <p className="text-sm text-purple-200">
                    {account.lastPayment 
                      ? `₹${account.lastPayment.amount.toLocaleString()} (${new Date(account.lastPayment.date).toLocaleDateString()})`
                      : 'None'
                    }
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {account.type === 'credit-card' ? (
                  <>
                    <Button
                      onClick={() => handlePayment(account.id, account.minPayment, 'minimum')}
                      disabled={bankBalance < account.minPayment}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white"
                      size="sm"
                    >
                      Pay Min (₹{account.minPayment.toLocaleString()})
                    </Button>
                    <Button
                      onClick={() => handlePayment(account.id, account.outstanding, 'full')}
                      disabled={bankBalance < account.outstanding}
                      className="bg-green-600 hover:bg-green-500 text-white"
                      size="sm"
                    >
                      Pay Full
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handlePayment(account.id, account.minPayment, 'emi')}
                    disabled={bankBalance < account.minPayment}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    size="sm"
                  >
                    Pay EMI (₹{account.minPayment.toLocaleString()})
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customPayments[account.id] || ''}
                    onChange={(e) => setCustomPayments({...customPayments, [account.id]: e.target.value})}
                    className="w-32 bg-purple-800/50 border-purple-600 text-purple-100"
                    size={undefined}
                  />
                  <Button
                    onClick={() => {
                      const amount = parseFloat(customPayments[account.id]);
                      if (amount && amount > 0) {
                        handlePayment(account.id, amount, 'custom');
                        setCustomPayments({...customPayments, [account.id]: ''});
                      }
                    }}
                    disabled={!customPayments[account.id] || parseFloat(customPayments[account.id]) <= 0}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                    size="sm"
                  >
                    Pay Custom
                  </Button>
                </div>
              </div>

              <div className="bg-purple-900/50 p-3 rounded-lg space-y-2">
                {getSmartTips(account).map((tip, index) => (
                  <p key={index} className="text-purple-200 text-sm">{tip}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200 mb-4">No accounts added yet</p>
            <p className="text-purple-300 text-sm">Add your credit cards and loans to start tracking</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
