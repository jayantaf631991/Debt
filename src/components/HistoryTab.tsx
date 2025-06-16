import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Download, Filter } from "lucide-react";
import { PaymentLog, Expense } from "@/pages/Index";
interface HistoryTabProps {
  paymentLogs: PaymentLog[];
  expenses: Expense[];
}
export const HistoryTab: React.FC<HistoryTabProps> = ({
  paymentLogs,
  expenses
}) => {
  const [filterType, setFilterType] = useState<'all' | 'payments' | 'expenses'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Combine and sort all transactions
  const allTransactions = [...paymentLogs.map(log => ({
    id: log.id,
    type: 'payment' as const,
    date: log.date,
    amount: log.amount,
    description: `Payment to ${log.accountName}`,
    category: log.type,
    data: log
  })), ...expenses.map(expense => ({
    id: expense.id,
    type: 'expense' as const,
    date: expense.date,
    amount: expense.amount,
    description: expense.name,
    category: expense.category,
    data: expense
  }))];
  const filteredTransactions = allTransactions.filter(transaction => {
    if (filterType === 'payments') return transaction.type === 'payment';
    if (filterType === 'expenses') return transaction.type === 'expense';
    return true;
  });
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category'];
    const csvData = sortedTransactions.map(transaction => [new Date(transaction.date).toLocaleDateString(), transaction.type, transaction.description, transaction.amount, transaction.category]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const getTransactionIcon = (type: string) => {
    return type === 'payment' ? '💳' : '🏷️';
  };
  const getTransactionColor = (type: string) => {
    return type === 'payment' ? 'border-green-400/30 bg-green-500/10' : 'border-blue-400/30 bg-blue-500/10';
  };
  const getBadgeColor = (type: string, category: string) => {
    if (type === 'payment') {
      if (category === 'full') return 'bg-green-500';
      if (category === 'minimum') return 'bg-yellow-500';
      return 'bg-blue-500';
    }
    return 'bg-purple-500';
  };

  // Calculate statistics
  const totalPayments = paymentLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthPayments = paymentLogs.filter(log => {
    const logDate = new Date(log.date);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  }).reduce((sum, log) => sum + log.amount, 0);
  return <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#09008d]">Total Payments Made</p>
              <p className="text-lg font-bold text-[#09008d]">₹{totalPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#09008d]">Total Expenses</p>
              <p className="text-lg font-bold text-[#09008d]">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#09008d]">This Month's Payments</p>
              <p className="text-lg font-bold text-[#09008d]">₹{thisMonthPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-100">
              <History className="h-6 w-6 text-purple-300" />
              Transaction History ({sortedTransactions.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32 bg-purple-800/50 border-purple-600 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-32 bg-purple-800/50 border-purple-600 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportToCSV} variant="outline" className="bg-purple-800/50 border-purple-600 text-purple-200 hover:bg-purple-700/50">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedTransactions.map(transaction => <Card key={transaction.id} className={`${getTransactionColor(transaction.type)} border backdrop-blur-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{transaction.description}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-300 text-sm">
                          {new Date(transaction.date).toLocaleDateString()} • 
                          {new Date(transaction.date).toLocaleTimeString()}
                        </span>
                        <Badge className={getBadgeColor(transaction.type, transaction.category)}>
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {transaction.type === 'payment' ? '-' : ''}₹{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.type === 'payment' && <p className="text-gray-300 text-sm">
                        Balance: ₹{(transaction.data as PaymentLog).balanceAfter.toLocaleString()}
                      </p>}
                  </div>
                </div>
              </CardContent>
            </Card>)}

          {sortedTransactions.length === 0 && <div className="text-center py-12">
              <History className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-200 text-lg mb-2">No transactions yet</p>
              <p className="text-purple-300">Start making payments or adding expenses to see your history</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
};