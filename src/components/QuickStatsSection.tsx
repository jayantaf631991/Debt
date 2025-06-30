
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, Calendar, Shield, TrendingDown, Calculator, Target } from "lucide-react";
import { Expense, Account } from "@/pages/Index";

interface QuickStatsSectionProps {
  bankBalance: number;
  emergencyFund: number;
  expenses: Expense[];
  accounts: Account[];
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({
  bankBalance,
  emergencyFund,
  expenses,
  accounts
}) => {
  // Calculate totals from accounts
  const totalOutstanding = accounts.reduce((sum, account) => sum + account.outstanding, 0);
  
  // Calculate minimum payments for credit cards only
  const totalCCMinPayments = accounts
    .filter(account => account.type === 'credit-card')
    .reduce((sum, account) => sum + account.minPayment, 0);
  
  // Calculate EMI for loans only
  const totalEMI = accounts
    .filter(account => account.type === 'loan')
    .reduce((sum, account) => sum + account.minPayment, 0);

  // Calculate total dues (CC min payments + loan EMIs)
  const totalDues = totalCCMinPayments + totalEMI;

  // Calculate expected balance after total dues
  const expectedBalance = bankBalance - totalDues;

  // Calculate credit limit totals
  const totalCreditLimit = accounts.reduce((sum, account) => sum + (account.creditLimit || 0), 0);
  const totalLimitExhausted = accounts.reduce((sum, account) => sum + account.outstanding, 0);
  const totalLimitAvailable = totalCreditLimit - totalLimitExhausted;

  return (
    <div className="space-y-4 mb-8">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                  CC Min Payments
                </p>
                <p className="text-2xl font-bold text-black">
                  ₹{totalCCMinPayments.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-800" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-600/30 to-yellow-500/30 border-orange-400/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-bold text-sm">
                  Total EMI
                </p>
                <p className="text-2xl font-bold text-black">
                  ₹{totalEMI.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600/30 to-violet-500/30 border-purple-400/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-bold text-sm">
                  Total Dues
                </p>
                <p className="text-2xl font-bold text-black">
                  ₹{totalDues.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-800" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${expectedBalance >= 0 ? 'from-teal-600/30 to-cyan-500/30 border-teal-400/50' : 'from-red-600/30 to-orange-500/30 border-red-400/50'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-bold text-sm">
                  Expected Balance
                </p>
                <p className="text-2xl font-bold text-black">
                  ₹{expectedBalance.toLocaleString()}
                </p>
              </div>
              <TrendingDown className={`h-8 w-8 ${expectedBalance >= 0 ? 'text-teal-800' : 'text-red-800'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Limit Stats Row */}
      {totalCreditLimit > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-indigo-600/30 to-blue-500/30 border-indigo-400/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm">
                    Total Credit Limit
                  </p>
                  <p className="text-2xl font-bold text-black">
                    ₹{totalCreditLimit.toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 text-indigo-800" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-600/30 to-orange-500/30 border-red-400/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm">
                    Limit Exhausted
                  </p>
                  <p className="text-2xl font-bold text-black">
                    ₹{totalLimitExhausted.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">
                    {totalCreditLimit > 0 ? ((totalLimitExhausted / totalCreditLimit) * 100).toFixed(1) : 0}% utilized
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-red-800" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-600/30 to-emerald-500/30 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm">
                    Limit Available
                  </p>
                  <p className="text-2xl font-bold text-black">
                    ₹{totalLimitAvailable.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">
                    {totalCreditLimit > 0 ? ((totalLimitAvailable / totalCreditLimit) * 100).toFixed(1) : 0}% available
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
