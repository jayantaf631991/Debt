
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PiggyBank, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface BankSectionProps {
  bankBalance: number;
  onBankBalanceChange: (newBalance: number) => void;
}

export const BankSection: React.FC<BankSectionProps> = ({ 
  bankBalance, 
  onBankBalanceChange 
}) => {
  const [amount, setAmount] = useState('');

  const handleAddMoney = () => {
    const addAmount = parseFloat(amount);
    if (addAmount && addAmount > 0) {
      onBankBalanceChange(bankBalance + addAmount);
      setAmount('');
      toast.success(`₹${addAmount.toLocaleString()} added to bank balance`);
    }
  };

  const handleWithdrawMoney = () => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount && withdrawAmount > 0) {
      if (withdrawAmount <= bankBalance) {
        onBankBalanceChange(bankBalance - withdrawAmount);
        setAmount('');
        toast.success(`₹${withdrawAmount.toLocaleString()} withdrawn from bank balance`);
      } else {
        toast.error("Insufficient balance");
      }
    }
  };

  return (
    <Card className="bg-green-800/30 border-green-600/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-100">
          <PiggyBank className="h-6 w-6 text-green-300" />
          Bank Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-100">₹{bankBalance.toLocaleString()}</p>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-green-800/50 border-green-600 text-green-100"
          />
          <Button 
            onClick={handleAddMoney}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleWithdrawMoney}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
