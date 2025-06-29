
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Account, Expense } from "@/pages/Index";

interface AnalyticsTabProps {
  accounts: Account[];
  expenses: Expense[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ accounts, expenses }) => {
  const debtData = accounts.map(acc => ({
    name: acc.name,
    outstanding: acc.outstanding,
    type: acc.type
  }));

  const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const creditCardDebt = accounts.filter(acc => acc.type === 'credit-card').reduce((sum, acc) => sum + acc.outstanding, 0);
  const loanDebt = accounts.filter(acc => acc.type === 'loan').reduce((sum, acc) => sum + acc.outstanding, 0);

  const pieData = [
    { name: 'Credit Cards', value: creditCardDebt, color: '#8b5cf6' },
    { name: 'Loans', value: loanDebt, color: '#06b6d4' }
  ].filter(item => item.value > 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount
  }));

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-100">Total Debt</h3>
              <p className="text-2xl font-bold text-purple-200">₹{totalDebt.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-100">Credit Cards</h3>
              <p className="text-2xl font-bold text-blue-200">₹{creditCardDebt.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-100">Loans</h3>
              <p className="text-2xl font-bold text-cyan-200">₹{loanDebt.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={debtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b46c1" />
                <XAxis dataKey="name" stroke="#c4b5fd" />
                <YAxis stroke="#c4b5fd" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#581c87', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    color: '#e9d5ff'
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Outstanding']}
                />
                <Bar dataKey="outstanding" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Debt Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: '#581c87', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    color: '#e9d5ff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6b46c1" />
              <XAxis dataKey="category" stroke="#c4b5fd" />
              <YAxis stroke="#c4b5fd" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#581c87', 
                  border: '1px solid #8b5cf6',
                  borderRadius: '8px',
                  color: '#e9d5ff'
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
