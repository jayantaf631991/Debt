import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Account, Expense, PaymentLog } from "@/pages/Index";

interface ChartsTabProps {
  accounts: Account[];
  expenses: Expense[];
  paymentLogs: PaymentLog[];
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
  accounts,
  expenses,
  paymentLogs
}) => {
  // Calculate data for charts
  const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPayments = paymentLogs.reduce((sum, log) => sum + log.amount, 0);

  const debtByType = accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + account.outstanding;
    return acc;
  }, {} as Record<string, number>);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-bold text-xl">Total Debt</p>
                <p className="font-bold text-xl text-blue-200">₹{totalDebt.toLocaleString()}</p>
              </div>
              <PieChart className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 font-bold text-xl">Total Expenses</p>
                <p className="font-bold text-xl text-purple-200">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 font-bold text-xl">Total Payments</p>
                <p className="font-bold text-xl text-green-200">₹{totalPayments.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Debt by Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map(account => {
                const percentage = totalDebt > 0 ? (account.outstanding / totalDebt) * 100 : 0;
                return (
                  <div key={account.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">{account.name}</span>
                      <span className="text-purple-100">₹{account.outstanding.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-800/30 border-indigo-600/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-indigo-100">Debt by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(debtByType).map(([type, amount]) => {
                const percentage = totalDebt > 0 ? (amount / totalDebt) * 100 : 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200 capitalize">{type.replace('-', ' ')}</span>
                      <span className="text-indigo-100">₹{amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Breakdown */}
      <Card className="bg-cyan-800/30 border-cyan-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-100">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-200 capitalize">{category}</span>
                    <span className="text-cyan-100">₹{amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-cyan-900/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interest Rate Analysis */}
      <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-100">Interest Rate Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map(account => {
              const monthlyInterest = account.outstanding * account.interestRate / 100 / 12;
              return (
                <div key={account.id} className="bg-orange-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-orange-100">{account.name}</h3>
                    <span className="text-orange-200">{account.interestRate}% APR</span>
                  </div>
                  <div className="text-sm text-orange-200">
                    <p>Monthly interest: ₹{monthlyInterest.toFixed(0)}</p>
                    <p>Annual interest: ₹{(monthlyInterest * 12).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
