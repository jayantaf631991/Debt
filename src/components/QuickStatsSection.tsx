
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, Calendar, Shield } from "lucide-react";

interface QuickStatsSectionProps {
  bankBalance: number;
  totalOutstanding: number;
  totalMinPayments: number;
  emergencyFund: number;
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({
  bankBalance,
  totalOutstanding,
  totalMinPayments,
  emergencyFund
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-r from-emerald-600/30 to-green-500/30 border-emerald-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Bank Balance</p>
              <p className="text-2xl font-bold text-white">₹{bankBalance.toLocaleString()}</p>
            </div>
            <Banknote className="h-8 w-8 text-emerald-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-600/30 to-pink-500/30 border-red-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Outstanding</p>
              <p className="text-2xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border-blue-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Min Payments Due</p>
              <p className="text-2xl font-bold text-white">₹{totalMinPayments.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-600/30 to-violet-500/30 border-purple-400/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Emergency Fund</p>
              <p className="text-2xl font-bold text-white">₹{emergencyFund.toLocaleString()}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
