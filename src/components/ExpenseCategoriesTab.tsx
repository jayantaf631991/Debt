
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, BarChart3, FileText } from "lucide-react";
import { Expense } from "@/pages/Index";

interface ExpenseCategoriesTabProps {
  expenses: Expense[];
}

export const ExpenseCategoriesTab: React.FC<ExpenseCategoriesTabProps> = ({ expenses }) => {
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: { total: number; count: number; items: Expense[] } } = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { total: 0, count: 0, items: [] };
      }
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
      categoryTotals[expense.category].items.push(expense);
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryColor = (category: string) => {
    const colors = {
      utilities: 'bg-blue-500',
      groceries: 'bg-green-500',
      transport: 'bg-yellow-500',
      entertainment: 'bg-purple-500',
      healthcare: 'bg-red-500',
      education: 'bg-indigo-500',
      shopping: 'bg-pink-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      utilities: '⚡',
      groceries: '🛒',
      transport: '🚗',
      entertainment: '🎬',
      healthcare: '🏥',
      education: '📚',
      shopping: '🛍️',
      other: '📦'
    };
    return icons[category as keyof typeof icons] || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{categoryData.length}</p>
              </div>
              <PieChart className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Avg per Category</p>
                <p className="text-2xl font-bold text-white">
                  ₹{categoryData.length > 0 ? Math.round(totalExpenses / categoryData.length).toLocaleString() : '0'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <PieChart className="h-6 w-6 text-blue-400" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">No expenses recorded yet</p>
            </div>
          ) : (
            categoryData.map((category) => {
              const percentage = (category.total / totalExpenses) * 100;
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                      <div>
                        <h3 className="text-slate-200 font-medium capitalize">
                          {category.category}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {category.count} transaction{category.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-100 font-bold">₹{category.total.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getCategoryColor(category.category)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Recent items in this category */}
                  <div className="ml-11 space-y-1">
                    {category.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-300">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">₹{item.amount.toLocaleString()}</span>
                          <Badge variant={item.isPaid ? 'default' : 'secondary'} className="text-xs">
                            {item.isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {category.items.length > 3 && (
                      <p className="text-slate-500 text-xs">
                        +{category.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <BarChart3 className="h-6 w-6 text-green-400" />
            Monthly Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">No monthly data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyData.map((month) => {
                const maxAmount = Math.max(...monthlyData.map(m => m.total));
                const percentage = (month.total / maxAmount) * 100;
                
                return (
                  <div key={month.month} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-medium">{month.month}</span>
                      <span className="text-slate-100 font-bold">₹{month.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
