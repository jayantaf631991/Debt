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
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    // For minimum/EMI payments, add the custom amount to the minimum payment
    let finalAmount = amount;
    if (type === 'custom') {
      if (account.type === 'credit-card') {
        finalAmount = account.minPayment + amount; // Add to minimum payment
      } else {
        finalAmount = account.minPayment + amount; // Add to EMI
      }
    }

    if (finalAmount > bankBalance) {
      toast.error("Insufficient bank balance!");
      return;
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          outstanding: Math.max(0, acc.outstanding - finalAmount),
          lastPayment: {
            amount: finalAmount,
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
      amount: finalAmount,
      type,
      date: new Date().toISOString(),
      balanceBefore: bankBalance,
      balanceAfter: bankBalance - finalAmount
    };

    onPaymentMade(payment);
    toast.success(`Payment of ₹${finalAmount.toLocaleString()} made successfully!`);
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

  const getIntelligentPaymentOptions = (account: Account) => {
    const availableAmount = bankBalance * 0.7; // Use max 70% of available balance
    const monthlyRate = (account.interestRate / 100) / 12;
    
    const options = [];
    
    // Strategy 1: Reduce EMI/Min payment by 10-15%
    if (account.type === 'loan') {
      const targetReduction = account.minPayment * 0.12; // 12% reduction
      const extraAmount = (targetReduction * account.outstanding) / (account.minPayment - targetReduction);
      if (extraAmount > 0 && extraAmount <= availableAmount) {
        const newOutstanding = Math.max(0, account.outstanding - extraAmount);
        const newEMI = newOutstanding > 0 ? (newOutstanding * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -12)) : 0;
        const emiReduction = account.minPayment - newEMI;
        
        options.push({
          extraAmount: Math.round(extraAmount),
          description: `EMI Relief: Pay ₹${Math.round(extraAmount).toLocaleString()} extra → EMI reduces by ₹${Math.round(emiReduction).toLocaleString()}/month`,
          benefit: `EMI Relief`,
          impact: Math.round(emiReduction)
        });
      }
    }

    // Strategy 2: Reduce tenure by 6-12 months
    if (account.type === 'loan') {
      const currentTenure = Math.log(1 + (account.outstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate);
      const targetTenure = Math.max(6, currentTenure - 9); // Reduce by 9 months
      
      const requiredEMI = (account.outstanding * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -targetTenure));
      const extraAmount = requiredEMI - account.minPayment;
      
      if (extraAmount > 0 && extraAmount <= availableAmount) {
        const tenureReduction = currentTenure - targetTenure;
        const interestSaved = (requiredEMI * targetTenure) - (account.minPayment * currentTenure);
        
        options.push({
          extraAmount: Math.round(extraAmount),
          description: `Tenure Cut: Pay ₹${Math.round(extraAmount).toLocaleString()} extra monthly → Save ${Math.round(tenureReduction)} months & ₹${Math.abs(Math.round(interestSaved)).toLocaleString()} interest`,
          benefit: `Tenure Reduction`,
          impact: Math.round(tenureReduction)
        });
      }
    }

    // Strategy 3: Interest optimization (10-20% interest reduction)
    const interestOptimizationAmounts = [
      account.outstanding * 0.05, // 5% of outstanding
      account.outstanding * 0.10, // 10% of outstanding
      account.outstanding * 0.15  // 15% of outstanding
    ];

    interestOptimizationAmounts.forEach(extraAmount => {
      if (extraAmount <= availableAmount && extraAmount >= 1000) {
        const newOutstanding = Math.max(0, account.outstanding - extraAmount);
        const currentMonthlyInterest = account.outstanding * monthlyRate;
        const newMonthlyInterest = newOutstanding * monthlyRate;
        const interestSaved = currentMonthlyInterest - newMonthlyInterest;
        
        if (interestSaved >= 100) { // Only show if saves at least ₹100/month
          let tenureReduction = 0;
          if (account.type === 'loan') {
            const currentTenure = Math.log(1 + (account.outstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate);
            const newTenure = newOutstanding > 0 ? Math.log(1 + (newOutstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate) : 0;
            tenureReduction = currentTenure - newTenure;
          }
          
          options.push({
            extraAmount: Math.round(extraAmount),
            description: account.type === 'loan' 
              ? `Interest Save: Pay ₹${Math.round(extraAmount).toLocaleString()} → Save ₹${Math.round(interestSaved).toLocaleString()}/month + ${Math.round(tenureReduction)} months`
              : `Interest Save: Pay ₹${Math.round(extraAmount).toLocaleString()} → Save ₹${Math.round(interestSaved).toLocaleString()}/month`,
            benefit: `Interest Optimization`,
            impact: Math.round(interestSaved)
          });
        }
      }
    });

    // Strategy 4: Complete payoff options
    if (account.outstanding <= availableAmount) {
      const totalInterestSaved = account.type === 'loan' 
        ? (account.minPayment * 12) - account.outstanding // Rough calculation
        : (account.outstanding * monthlyRate * 6); // 6 months of interest saved
      
      options.push({
        extraAmount: account.outstanding,
        description: `Full Payoff: Clear entire debt → Save ₹${Math.round(totalInterestSaved).toLocaleString()} in future interest + monthly EMI/payment`,
        benefit: `Complete Freedom`,
        impact: account.minPayment
      });
    }

    return options.slice(0, 4); // Return top 4 options
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
                    placeholder="Extra amount"
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
                    Pay Extra
                  </Button>
                  <span className="text-purple-300 text-xs">
                    (Added to {account.type === 'credit-card' ? 'minimum' : 'EMI'})
                  </span>
                </div>
              </div>

              <div className="bg-purple-900/50 p-3 rounded-lg space-y-2">
                <h4 className="text-purple-200 font-medium mb-2">💡 Smart Payment Strategies</h4>
                {getIntelligentPaymentOptions(account).map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-purple-800/30 p-2 rounded text-sm">
                    <span className="text-purple-200">{option.description}</span>
                    <Badge className="bg-purple-600 text-white">{option.benefit}</Badge>
                  </div>
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
