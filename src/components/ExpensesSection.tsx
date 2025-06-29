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
  onExpenseAddedToCC: (accountId: string, amount: number) => void;
  onExpenseRemoved: (expense: Expense) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ 
  expenses, 
  bankBalance, 
  accounts, 
  onExpensesChange, 
  onExpensePaid,
  onExpenseAddedToCC,
  onExpenseRemoved
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

    const amount = parseFloat(newExpense.amount);
    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: amount,
      type: newExpense.type,
      paymentMethod: newExpense.paymentMethod,
      isPaid: false,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      category: newExpense.category
    };

    // If payment method is a credit card, add to CC outstanding
    if (newExpense.paymentMethod !== 'bank') {
      const account = accounts.find(acc => acc.name === newExpense.paymentMethod);
      if (account?.type === 'credit-card') {
        onExpenseAddedToCC(account.id, amount);
        expense.isPaid = true; // Mark as paid since it's charged to CC
        toast.success(`Expense of ₹${amount.toLocaleString()} charged to ${account.name}`);
      }
    }

    onExpensesChange([...expenses, expense]);
    setNewExpense({
      name: '',
      amount: '',
      type: 'one-time' as 'recurring' | 'one-time',
      paymentMethod: 'bank',
      category: 'utilities'
    });
    setIsAddDialogOpen(false);
    
    if (newExpense.paymentMethod === 'bank') {
      toast.success("Expense added successfully!");
    }
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
    }

    toast.success(`Expense of ₹${expense.amount.toLocaleString()} marked as paid!`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) return;

    // If expense was paid, refund the amount
    if (expense.isPaid) {
      onExpenseRemoved(expense);
    }

    onExpensesChange(expenses.filter(exp => exp.id !== expenseId));
    toast.success("Expense deleted successfully");
  };

  const handleToggleRecurring = (expenseId: string) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === expenseId 
        ? { ...exp, type: exp.type === 'recurring' ? 'one-time' as const : 'recurring' as const } 
        : exp
    );
    onExpensesChange(updatedExpenses);
  };

  const totalPaidExpenses = expenses.filter(exp => exp.isPaid).reduce((sum, exp) => sum + exp.amount, 0);
  const totalPendingExpenses = expenses.filter(exp => !exp.isPaid).reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <FileText className="h-6 w-6 text-green-600" />
            Expenses Management ({expenses.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700">Expense Name</Label>
                  <Input
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                    className="bg-white border-gray-300 text-gray-800"
                    placeholder="e.g., Electricity Bill"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Amount</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="bg-white border-gray-300 text-gray-800"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-gray-800">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Type</Label>
                  <Select 
                    value={newExpense.type} 
                    onValueChange={(value: 'recurring' | 'one-time') => setNewExpense({...newExpense, type: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="one-time" className="text-gray-800">One-time</SelectItem>
                      <SelectItem value="recurring" className="text-gray-800">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Payment Method</Label>
                  <Select 
                    value={newExpense.paymentMethod} 
                    onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="bank" className="text-gray-800">Bank Account</SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.name} className="text-gray-800">{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddExpense} className="w-full bg-green-600 hover:bg-green-700">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-green-700 text-sm">Paid Expenses</p>
            <p className="text-xl font-bold text-green-800">₹{totalPaidExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">Pending Expenses</p>
            <p className="text-xl font-bold text-red-800">₹{totalPendingExpenses.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{expense.name}</h3>
                    <Badge variant={expense.type === 'recurring' ? 'default' : 'secondary'}>
                      {expense.type}
                    </Badge>
                    <Badge variant="outline" className="text-gray-700 border-gray-400">
                      {expense.category}
                    </Badge>
                    {expense.isPaid && <Badge className="bg-green-500">Paid</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span className="font-medium">₹{expense.amount.toLocaleString()}</span>
                    <span>via {expense.paymentMethod}</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!expense.isPaid && expense.paymentMethod === 'bank' && (
                    <Button
                      onClick={() => handlePayExpense(expense.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRecurring(expense.id)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-700"
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No expenses added yet</p>
            <p className="text-gray-500 text-sm">Add your bills and expenses to track spending</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
