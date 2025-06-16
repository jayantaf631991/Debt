
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Target, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EmergencyFundCardProps {
  currentAmount: number;
  targetAmount: number;
  bankBalance: number;
  onSave: (amount: number) => void;
  onGoalChange: (newGoal: number) => void;
}

export const EmergencyFundCard: React.FC<EmergencyFundCardProps> = ({
  currentAmount,
  targetAmount,
  bankBalance,
  onSave,
  onGoalChange
}) => {
  const [saveAmount, setSaveAmount] = useState('');
  const [newGoal, setNewGoal] = useState(targetAmount.toString());

  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  const handleSave = () => {
    const amount = parseFloat(saveAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > bankBalance) {
      toast.error("Insufficient bank balance!");
      return;
    }

    onSave(amount);
    setSaveAmount('');
    toast.success(`₹${amount.toLocaleString()} saved to emergency fund! 🎉`);
  };

  const handleGoalUpdate = () => {
    const goal = parseFloat(newGoal);
    if (!goal || goal <= 0) {
      toast.error("Please enter a valid goal amount");
      return;
    }

    onGoalChange(goal);
    toast.success("Emergency fund goal updated!");
  };

  const suggestedSavings = [
    { amount: 500, reason: "Daily coffee budget" },
    { amount: 1000, reason: "Weekly entertainment" },
    { amount: 2500, reason: "Monthly dining out" },
    { amount: 5000, reason: "Unexpected bonus" }
  ];

  const getMotivationalMessage = () => {
    if (progressPercentage === 100) {
      return "🎉 Congratulations! Your emergency fund is fully funded!";
    } else if (progressPercentage >= 75) {
      return "🔥 You're almost there! Keep up the great work!";
    } else if (progressPercentage >= 50) {
      return "💪 Great progress! You're halfway to financial security!";
    } else if (progressPercentage >= 25) {
      return "🌱 Good start! Every rupee counts towards your security!";
    } else {
      return "🚀 Start building your safety net today!";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Emergency Fund Card */}
      <Card className="bg-gradient-to-r from-emerald-800/40 to-teal-700/40 border-emerald-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-100">
            <Shield className="h-6 w-6 text-emerald-300" />
            Emergency Fund Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-emerald-200 text-sm">Current Amount</p>
                <p className="text-3xl font-bold text-white">₹{currentAmount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-200 text-sm">Target Amount</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-32 bg-emerald-900/50 border-emerald-600 text-white text-right"
                  />
                  <Button
                    onClick={handleGoalUpdate}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-200">Progress</span>
                <span className="text-emerald-200">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="text-center">
              <Badge className={`${progressPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                {getMotivationalMessage()}
              </Badge>
            </div>

            {remainingAmount > 0 && (
              <div className="bg-emerald-900/30 p-4 rounded-lg">
                <p className="text-emerald-200 text-sm">Remaining to Goal</p>
                <p className="text-2xl font-bold text-white">₹{remainingAmount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Save Money Section */}
          <div className="space-y-4">
            <h3 className="text-emerald-100 font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Add to Emergency Fund
            </h3>
            
            <div className="flex gap-2">
              <Input
                type="number"
                value={saveAmount}
                onChange={(e) => setSaveAmount(e.target.value)}
                placeholder="Enter amount to save"
                className="bg-emerald-900/50 border-emerald-600 text-white"
              />
              <Button
                onClick={handleSave}
                disabled={!saveAmount || parseFloat(saveAmount) > bankBalance}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Save Now
              </Button>
            </div>

            {/* Quick Save Suggestions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {suggestedSavings.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveAmount(suggestion.amount.toString())}
                  disabled={suggestion.amount > bankBalance}
                  className="bg-emerald-800/50 border-emerald-600 text-emerald-200 hover:bg-emerald-700/50 text-xs p-2 h-auto flex-col"
                >
                  <span className="font-bold">₹{suggestion.amount}</span>
                  <span className="text-xs opacity-80">{suggestion.reason}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund Tips */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Emergency Fund Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-slate-200 font-medium">Why Emergency Fund?</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Prevents debt during emergencies</li>
                <li>• Reduces financial stress</li>
                <li>• Provides peace of mind</li>
                <li>• Protects your investments</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-200 font-medium">Smart Saving Tips</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Automate your savings</li>
                <li>• Start with ₹500/month</li>
                <li>• Save windfalls immediately</li>
                <li>• Keep it in liquid funds</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-900/30 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium text-sm">Pro Tip</p>
                <p className="text-blue-300 text-sm">
                  Aim for 6 months of expenses. If your monthly expenses are ₹25,000, target ₹1,50,000 emergency fund.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
