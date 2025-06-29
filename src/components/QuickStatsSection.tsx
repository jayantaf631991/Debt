
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, Calendar, Shield } from "lucide-react";
import { Expense } from "@/pages/Index";

interface QuickStatsSectionProps {
  bankBalance: number;
  emergencyFund: number;
  expenses: Expense[];
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({
  bankBalance,
  emergencyFund,
  expenses
}) => {
  // Calculate total outstanding and min payments from expenses
  const totalOutstanding = expenses.reduce((sum, expense) => 
    expense.isPaid ? sum : sum + expense.amount, 0
  );
  
  const totalMinPayments = expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-r from-emerald-600/30 to-green-500/30 border-emerald-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                Bank Balance
              </p>
              <p className="text-2xl font-bold text-black">
                ₹{bankBalance.toLocaleString()}
              </p>
            </div>
            <Banknote className="h-8 w-8 text-emerald-800" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-600/30 to-pink-500/30 border-red-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold text-black">
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-red-800" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border-blue-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                Min Payments Due
              </p>
              <p className="text-2xl font-bold text-black">
                ₹{totalMinPayments.toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-800" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-600/30 to-violet-500/30 border-purple-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                Emergency Fund
              </p>
              <p className="text-2xl font-bold text-black">
                ₹{emergencyFund.toLocaleString()}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-800" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
