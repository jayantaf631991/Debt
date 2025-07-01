import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Trash2, AlertTriangle, Edit2, Check, X, Calculator, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Account, PaymentLog, Expense } from "@/pages/Index";

interface AccountsSectionProps {
  accounts: Account[];
  expenses: Expense[];
  bankBalance: number;
  onAccountsChange: (accounts: Account[]) => void;
  onPaymentMade: (payment: PaymentLog) => void;
}

export const AccountsSection: React.FC<AccountsSectionProps> = ({ 
  accounts, 
  expenses,
  bankBalance, 
  onAccountsChange, 
  onPaymentMade 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customPayments, setCustomPayments] = useState<{ [key: string]: string }>({});
  const [editingField, setEditingField] = useState<{ accountId: string; field: string } | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [dynamicPaymentAmounts, setDynamicPaymentAmounts] = useState<{ [key: string]: string }>({});
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'credit-card' as 'credit-card' | 'loan',
    outstanding: '',
    minPayment: '',
    interestRate: '',
    dueDate: '',
    creditLimit: ''
  });

  // Calculate available amount after all EMIs and expenses
  const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);
  const totalExpenses = expenses.reduce((sum, exp) => exp.isPaid ? sum + exp.amount : sum, 0);
  const availableAfterObligations = bankBalance - totalMinPayments - totalExpenses;

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
      dueDate: newAccount.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creditLimit: parseFloat(newAccount.creditLimit) || undefined
    };

    onAccountsChange([...accounts, account]);
    setNewAccount({
      name: '',
      type: 'credit-card',
      outstanding: '',
      minPayment: '',
      interestRate: '',
      dueDate: '',
      creditLimit: ''
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
        let updatedAcc = { ...acc };
        
        if (field === 'type') {
          // When type changes, recalculate payment labels and logic
          updatedAcc.type = newValue as 'credit-card' | 'loan';
          
          // Adjust minimum payment if switching types
          if (newValue === 'loan' && acc.type === 'credit-card') {
            // Converting CC to loan - set a typical EMI
            updatedAcc.minPayment = Math.max(acc.minPayment, acc.outstanding * 0.02); // 2% of outstanding as EMI
          } else if (newValue === 'credit-card' && acc.type === 'loan') {
            // Converting loan to CC - set minimum payment as 5% of outstanding
            updatedAcc.minPayment = Math.max(500, acc.outstanding * 0.05);
          }
        } else if (field === 'name') {
          updatedAcc[field] = newValue;
        } else {
          updatedAcc[field] = parseFloat(newValue);
        }
        
        return updatedAcc;
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

  const calculateDynamicPaymentImpact = (account: Account, extraAmount: number) => {
    const monthlyRate = (account.interestRate / 100) / 12;
    const newOutstanding = Math.max(0, account.outstanding - extraAmount);
    
    if (account.type === 'credit-card') {
      const newMinPayment = Math.max(500, newOutstanding * 0.05);
      const currentInterest = account.outstanding * monthlyRate;
      const newInterest = newOutstanding * monthlyRate;
      const interestSaved = currentInterest - newInterest;
      
      // Calculate next due date (assuming 30 days cycle)
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 30);
      
      return {
        newOutstanding,
        newMinPayment,
        interestSaved,
        nextDueDate: nextDueDate.toLocaleDateString(),
        monthlyBenefit: interestSaved,
        payoffMonths: newOutstanding > 0 ? Math.ceil(newOutstanding / newMinPayment) : 0
      };
    } else {
      // For loans
      const currentTenure = account.outstanding > 0 && account.minPayment > 0 
        ? Math.log(1 + (account.outstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate)
        : 0;
      
      const newTenure = newOutstanding > 0 && account.minPayment > 0
        ? Math.log(1 + (newOutstanding * monthlyRate) / account.minPayment) / Math.log(1 + monthlyRate)
        : 0;
      
      const tenureReduction = Math.max(0, currentTenure - newTenure);
      const interestSaved = extraAmount * (account.interestRate / 100);
      
      // Calculate next EMI due date
      const nextDueDate = new Date(account.dueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      return {
        newOutstanding,
        newMinPayment: account.minPayment, // EMI remains same
        interestSaved: interestSaved / 12, // Monthly interest saved
        nextDueDate: nextDueDate.toLocaleDateString(),
        tenureReduction,
        monthlyBenefit: interestSaved / 12,
        payoffMonths: newTenure
      };
    }
  };

  const getOptimalPaymentStrategies = (account: Account) => {
    const strategies = [];
    const maxPayable = Math.min(availableAfterObligations * 0.8, account.outstanding);
    
    if (maxPayable <= 0) return strategies;

    // Strategy 1: Maximum benefit with available amount
    const maxBenefitAmount = Math.min(maxPayable, account.outstanding * 0.25);
    if (maxBenefitAmount > 1000) {
      const impact = calculateDynamicPaymentImpact(account, maxBenefitAmount);
      strategies.push({
        amount: Math.round(maxBenefitAmount),
        type: 'Maximum Benefit',
        description: `Pay ₹${Math.round(maxBenefitAmount).toLocaleString()} for maximum impact`,
        impact,
        priority: 'high'
      });
    }

    // Strategy 2: Moderate payment (50% of available)
    const moderateAmount = Math.min(maxPayable * 0.5, account.outstanding * 0.15);
    if (moderateAmount > 500 && moderateAmount !== maxBenefitAmount) {
      const impact = calculateDynamicPaymentImpact(account, moderateAmount);
      strategies.push({
        amount: Math.round(moderateAmount),
        type: 'Balanced Approach',
        description: `Pay ₹${Math.round(moderateAmount).toLocaleString()} for steady progress`,
        impact,
        priority: 'medium'
      });
    }

    // Strategy 3: Conservative payment (25% of available)
    const conservativeAmount = Math.min(maxPayable * 0.25, account.outstanding * 0.1);
    if (conservativeAmount > 500 && conservativeAmount !== moderateAmount) {
      const impact = calculateDynamicPaymentImpact(account, conservativeAmount);
      strategies.push({
        amount: Math.round(conservativeAmount),
        type: 'Conservative',
        description: `Pay ₹${Math.round(conservativeAmount).toLocaleString()} with safety buffer`,
        impact,
        priority: 'low'
      });
    }

    // Strategy 4: Complete payoff if feasible
    if (account.outstanding <= maxPayable) {
      const impact = calculateDynamicPaymentImpact(account, account.outstanding);
      strategies.push({
        amount: account.outstanding,
        type: 'Complete Payoff',
        description: `Clear entire debt of ₹${account.outstanding.toLocaleString()}`,
        impact,
        priority: 'complete'
      });
    }

    return strategies;
  };

  const renderDynamicPaymentCalculator = (account: Account) => {
    const currentAmount = parseFloat(dynamicPaymentAmounts[account.id] || '0');
    const impact = currentAmount > 0 ? calculateDynamicPaymentImpact(account, currentAmount) : null;
    
    return (
      <div className="bg-indigo-900/50 p-4 rounded-lg space-y-3">
        <h4 className="text-indigo-200 font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Dynamic Payment Calculator
        </h4>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Enter amount"
            value={dynamicPaymentAmounts[account.id] || ''}
            onChange={(e) => setDynamicPaymentAmounts({...dynamicPaymentAmounts, [account.id]: e.target.value})}
            className="bg-indigo-800/50 border-indigo-600 text-indigo-100"
            max={availableAfterObligations}
          />
          <Badge className="bg-green-600 text-white">
            Max: ₹{availableAfterObligations.toLocaleString()}
          </Badge>
        </div>

        {impact && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-indigo-800/30 p-3 rounded">
              <p className="text-indigo-300">New Outstanding</p>
              <p className="text-indigo-100 font-semibold">₹{impact.newOutstanding.toLocaleString()}</p>
            </div>
            <div className="bg-indigo-800/30 p-3 rounded">
              <p className="text-indigo-300">Next Due</p>
              <p className="text-indigo-100 font-semibold">{impact.nextDueDate}</p>
            </div>
            <div className="bg-indigo-800/30 p-3 rounded">
              <p className="text-indigo-300">New Min Payment</p>
              <p className="text-indigo-100 font-semibold">₹{Math.round(impact.newMinPayment).toLocaleString()}</p>
            </div>
            <div className="bg-indigo-800/30 p-3 rounded">
              <p className="text-indigo-300">Monthly Savings</p>
              <p className="text-green-400 font-semibold">₹{Math.round(impact.monthlyBenefit).toLocaleString()}</p>
            </div>
            {account.type === 'loan' && impact.tenureReduction && (
              <div className="bg-indigo-800/30 p-3 rounded">
                <p className="text-indigo-300">Tenure Reduced</p>
                <p className="text-yellow-400 font-semibold">{Math.round(impact.tenureReduction)} months</p>
              </div>
            )}
            <div className="bg-indigo-800/30 p-3 rounded">
              <p className="text-indigo-300">Payoff Timeline</p>
              <p className="text-indigo-100 font-semibold">
                {impact.payoffMonths > 0 ? `${Math.round(impact.payoffMonths)} months` : 'Paid off!'}
              </p>
            </div>
          </div>
        )}

        {currentAmount > 0 && currentAmount <= availableAfterObligations && (
          <Button
            onClick={() => {
              handlePayment(account.id, currentAmount, 'custom');
              setDynamicPaymentAmounts({...dynamicPaymentAmounts, [account.id]: ''});
            }}
            className="w-full bg-green-600 hover:bg-green-500 mt-3"
          >
            Make Payment of ₹{currentAmount.toLocaleString()}
          </Button>
        )}
      </div>
    );
  };

  const renderEditableField = (account: Account, field: keyof Account, displayValue: string, isNumeric = false, isSelect = false) => {
    const isEditing = editingField?.accountId === account.id && editingField?.field === field;
    
    if (isEditing) {
      if (isSelect && field === 'type') {
        return (
          <div className="flex items-center gap-2">
            <Select 
              value={editValues[`${account.id}-${field}`] || account.type}
              onValueChange={(value) => setEditValues({...editValues, [`${account.id}-${field}`]: value})}
            >
              <SelectTrigger className="bg-purple-800/50 border-purple-600 text-purple-100 text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-purple-800 border-purple-600">
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
              </SelectContent>
            </Select>
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
      } else {
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
    }

    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-purple-600/20 p-1 rounded group"
        onClick={() => handleFieldEdit(account.id, field, field === 'type' ? account.type : displayValue)}
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
                  <Label className="text-purple-200">Credit Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={newAccount.creditLimit}
                    onChange={(e) => setNewAccount({...newAccount, creditLimit: e.target.value})}
                    className="bg-purple-800/50 border-purple-600 text-purple-100"
                    placeholder="100000"
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
        
        {/* Available Amount Display */}
        <div className="bg-green-800/30 border-green-600/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-green-200">Available for Extra Payments</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">₹{availableAfterObligations.toLocaleString()}</p>
              <p className="text-green-300 text-sm">After EMIs (₹{totalMinPayments.toLocaleString()}) & Expenses (₹{totalExpenses.toLocaleString()})</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id} className="bg-purple-700/30 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-purple-100 flex items-center gap-2">
                    {renderEditableField(account, 'name', account.name)}
                    {renderEditableField(account, 'type', account.type === 'credit-card' ? 'Card' : 'Loan', false, true)}
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

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-purple-300 text-sm">Outstanding</p>
                  <div className="text-lg font-bold text-red-300">
                    {renderEditableField(account, 'outstanding', `₹${account.outstanding.toLocaleString()}`, true)}
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">{account.type === 'credit-card' ? 'Min Payment' : 'EMI'}</p>
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
                  <p className="text-purple-300 text-sm">Credit Limit</p>
                  <div className="text-lg font-bold text-blue-300">
                    {renderEditableField(account, 'creditLimit', account.creditLimit ? `₹${account.creditLimit.toLocaleString()}` : 'Not set', true)}
                  </div>
                  {account.creditLimit && (
                    <p className="text-xs text-purple-400">
                      Available: ₹{(account.creditLimit - account.outstanding).toLocaleString()}
                    </p>
                  )}
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

              {/* Payment buttons */}
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

              {/* Dynamic Payment Calculator */}
              {renderDynamicPaymentCalculator(account)}

              {/* Optimal Payment Strategies */}
              <div className="bg-purple-900/50 p-3 rounded-lg space-y-2">
                <h4 className="text-purple-200 font-medium mb-2">💡 Optimal Payment Strategies</h4>
                {getOptimalPaymentStrategies(account).map((strategy, index) => (
                  <div key={index} className="flex items-center justify-between bg-purple-800/30 p-2 rounded text-sm">
                    <div>
                      <span className="text-purple-200 font-medium">{strategy.type}</span>
                      <p className="text-purple-300 text-xs">{strategy.description}</p>
                      <p className="text-xs text-purple-400">
                        New Outstanding: ₹{strategy.impact.newOutstanding.toLocaleString()} | 
                        Monthly Benefit: ₹{Math.round(strategy.impact.monthlyBenefit).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        strategy.priority === 'high' ? 'bg-red-600' : 
                        strategy.priority === 'medium' ? 'bg-yellow-600' : 
                        strategy.priority === 'complete' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {strategy.type}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDynamicPaymentAmounts({...dynamicPaymentAmounts, [account.id]: strategy.amount.toString()});
                        }}
                        className="ml-2 bg-purple-600 hover:bg-purple-500 text-xs"
                      >
                        Use Amount
                      </Button>
                    </div>
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
