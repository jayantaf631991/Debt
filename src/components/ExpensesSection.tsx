
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Trash2, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Expense, Account } from "@/pages/Index";

interface ExpensesSectionProps {
  expenses: Expense[];
  bankBalance: number;
  accounts: Account[];
  onExpensesChange: (expenses: Expense[]) => void;
  onExpensePaid: (amount: number) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ 
  expenses, 
  bankBalance, 
  accounts, 
  onExpensesChange, 
  onExpensePaid 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    type: 'one-time' as 'recurring' | 'one-time',
    paymentMethod: 'bank',
    category: 'utilities'
  });

  const categories = [
    'utilities', 'groceries', 'transport', 'entertainment', 
    'healthcare', 'education', 'shopping', 'other'
  ];

  const paymentMethods = [
    'bank',
    ...accounts.map(acc => acc.name)
  ];

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: parseFloat(newExpense.amount),
      type: newExpense.type,
      paymentMethod: newExpense.paymentMethod,
      isPaid: false,
      date: new Date().toISOString(),
      category: newExpense.category
    };

    onExpensesChange([...expenses, expense]);
    setNewExpense({
      name: '',
      amount: '',
      type: 'one-time',
      paymentMethod: 'bank',
      category: 'utilities'
    });
    setIsAddDialogOpen(false);
    toast.success("Expense added successfully!");
  };

  const handlePayExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) return;

    if (expense.paymentMethod === 'bank' && expense.amount > bankBalance) {
      toast.error("Insufficient bank balance!");
      return;
    }

    const updatedExpenses = expenses.map(exp => 
      exp.id === expenseId ? { ...exp, isPaid: true } : exp
    );

    onExpensesChange(updatedExpenses);

    if (expense.paymentMethod === 'bank') {
      onExpensePaid(expense.amount);
    } else {
      // Handle payment through credit card/account
      const account = accounts.find(acc => acc.name === expense.paymentMethod);
      if (account) {
        // Add to account outstanding for credit cards
        if (account.type === 'credit-card') {
          // This would need to be handled in the parent component
          toast.success(`Expense charged to ${account.name}`);
        }
      }
    }

    toast.success(`Expense of ₹${expense.amount.toLocaleString()} marked as paid!`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    onExpensesChange(expenses.filter(exp => exp.id !== expenseId));
    toast.success("Expense deleted successfully");
  };

  const handleToggleRecurring = (expenseId: string) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === expenseId 
        ? { ...exp, type: exp.type === 'recurring' ? 'one-time' : 'recurring' } 
        : exp
    );
    onExpensesChange(updatedExpenses);
  };

  const totalPaidExpenses = expenses.filter(exp => exp.isPaid).reduce((sum, exp) => sum + exp.amount, 0);
  const totalPendingExpenses = expenses.filter(exp => !exp.isPaid).reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card className="bg-indigo-800/30 border-indigo-600/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <FileText className="h-6 w-6 text-indigo-300" />
            Expenses ({expenses.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-indigo-900 border-indigo-600">
              <DialogHeader>
                <DialogTitle className="text-indigo-100">Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-indigo-200">Expense Name</Label>
                  <Input
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                    className="bg-indigo-800/50 border-indigo-600 text-indigo-100"
                    placeholder="e.g., Electricity Bill"
                  />
                </div>
                <div>
                  <Label className="text-indigo-200">Amount</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="bg-indigo-800/50 border-indigo-600 text-indigo-100"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <Label className="text-indigo-200">Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                  >
                    <SelectTrigger className="bg-indigo-800/50 border-indigo-600 text-indigo-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-indigo-800 border-indigo-600">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-indigo-200">Type</Label>
                  <Select 
                    value={newExpense.type} 
                    onValueChange={(value: 'recurring' | 'one-time') => setNewExpense({...newExpense, type: value})}
                  >
                    <SelectTrigger className="bg-indigo-800/50 border-indigo-600 text-indigo-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-indigo-800 border-indigo-600">
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-indigo-200">Payment Method</Label>
                  <Select 
                    value={newExpense.paymentMethod} 
                    onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-indigo-800/50 border-indigo-600 text-indigo-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-indigo-800 border-indigo-600">
                      <SelectItem value="bank">Bank Account</SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddExpense} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <p className="text-green-200 text-sm">Paid Expenses</p>
            <p className="text-xl font-bold text-green-100">₹{totalPaidExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/20 p-3 rounded-lg">
            <p className="text-red-200 text-sm">Pending Expenses</p>
            <p className="text-xl font-bold text-red-100">₹{totalPendingExpenses.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="bg-indigo-700/30 border-indigo-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-indigo-100">{expense.name}</h3>
                    <Badge variant={expense.type === 'recurring' ? 'default' : 'secondary'}>
                      {expense.type}
                    </Badge>
                    <Badge variant="outline" className="text-indigo-300 border-indigo-400">
                      {expense.category}
                    </Badge>
                    {expense.isPaid && <Badge className="bg-green-500">Paid</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-indigo-200">
                    <span>₹{expense.amount.toLocaleString()}</span>
                    <span>via {expense.paymentMethod}</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!expense.isPaid && (
                    <Button
                      onClick={() => handlePayExpense(expense.id)}
                      className="bg-green-600 hover:bg-green-500 text-white"
                      size="sm"
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRecurring(expense.id)}
                    className="text-indigo-300 hover:text-indigo-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {expenses.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
            <p className="text-indigo-200 mb-4">No expenses added yet</p>
            <p className="text-indigo-300 text-sm">Add your bills and expenses to track spending</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
