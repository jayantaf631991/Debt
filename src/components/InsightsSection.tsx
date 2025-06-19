
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { Account, PaymentLog } from "@/pages/Index";

interface InsightsSectionProps {
  accounts: Account[];
  paymentLogs: PaymentLog[];
  spendingCategories: { [key: string]: number };
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ 
  accounts, 
  paymentLogs, 
  spendingCategories 
}) => {
  const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalPayments = paymentLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalSpending = Object.values(spendingCategories).reduce((sum, amount) => sum + amount, 0);
  const highestInterestAccount = accounts.reduce((highest, acc) => 
    acc.interestRate > (highest?.interestRate || 0) ? acc : highest, null as Account | null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-800/30 border-blue-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Debt</p>
                <p className="text-2xl font-bold text-blue-100">₹{totalDebt.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-800/30 border-green-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-green-100">₹{totalPayments.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Monthly Spending</p>
                <p className="text-2xl font-bold text-orange-100">₹{totalSpending.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {highestInterestAccount && (
        <Card className="bg-red-800/30 border-red-600/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-100">
              <AlertCircle className="h-6 w-6 text-red-300" />
              High Interest Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-100">{highestInterestAccount.name}</h3>
                <p className="text-red-200">Highest interest rate in your portfolio</p>
              </div>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {highestInterestAccount.interestRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentLogs.slice(-5).reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-purple-700/30 p-3 rounded-lg">
                <div>
                  <h3 className="font-medium text-purple-100">{log.accountName}</h3>
                  <p className="text-purple-200 text-sm">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-100">₹{log.amount.toLocaleString()}</p>
                  <Badge variant={log.type === 'full' ? 'default' : 'secondary'}>
                    {log.type}
                  </Badge>
                </div>
              </div>
            ))}
            {paymentLogs.length === 0 && (
              <p className="text-purple-300 text-center py-4">No payments made yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
