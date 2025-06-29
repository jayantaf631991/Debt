import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, TrendingUp, Target, Plus, Edit2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Account, Expense } from "@/pages/Index";

interface WealthCreationTabProps {
  accounts: Account[];
  expenses: Expense[];
  bankBalance: number;
}

interface SavingEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
}

interface SavingGoal {
  monthly: number;
  target: number;
  purpose: string;
}

export const WealthCreationTab: React.FC<WealthCreationTabProps> = ({ 
  accounts, 
  expenses, 
  bankBalance 
}) => {
  const [savingGoal, setSavingGoal] = useState<SavingGoal>({
    monthly: 0,
    target: 0,
    purpose: 'Emergency Fund'
  });
  const [savingEntries, setSavingEntries] = useState<SavingEntry[]>([]);
  const [newSaving, setNewSaving] = useState({ amount: '', description: '' });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(savingGoal);

  // Load data from localStorage
  useEffect(() => {
    const storedGoal = localStorage.getItem('savingGoal');
    const storedEntries = localStorage.getItem('savingEntries');
    
    if (storedGoal) setSavingGoal(JSON.parse(storedGoal));
    if (storedEntries) setSavingEntries(JSON.parse(storedEntries));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('savingGoal', JSON.stringify(savingGoal));
  }, [savingGoal]);

  useEffect(() => {
    localStorage.setItem('savingEntries', JSON.stringify(savingEntries));
  }, [savingEntries]);

  // Calculate financial metrics
  const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);
  const totalExpenses = expenses.reduce((sum, exp) => exp.isPaid ? sum + exp.amount : sum, 0);
  const availableForSaving = bankBalance - totalMinPayments - totalExpenses;
  
  const totalSaved = savingEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const currentMonthSaved = savingEntries
    .filter(entry => new Date(entry.date).getMonth() === new Date().getMonth())
    .reduce((sum, entry) => sum + entry.amount, 0);

  // Intelligent advisor calculations
  const getIntelligentRecommendations = () => {
    const recommendations = [];
    
    // Emergency fund recommendation (3-6 months of expenses)
    const monthlyExpenses = totalMinPayments + totalExpenses;
    const emergencyFundTarget = monthlyExpenses * 4;
    
    if (totalSaved < emergencyFundTarget) {
      const shortfall = emergencyFundTarget - totalSaved;
      const monthsToGoal = Math.ceil(shortfall / Math.max(availableForSaving * 0.7, 1000));
      recommendations.push({
        type: 'Emergency Fund',
        target: emergencyFundTarget,
        current: totalSaved,
        monthly: Math.max(availableForSaving * 0.7, 1000),
        timeframe: `${monthsToGoal} months`,
        priority: 'High'
      });
    }

    // Investment recommendations
    if (totalSaved >= emergencyFundTarget && availableForSaving > 5000) {
      const sip20years = availableForSaving * 0.6;
      const futureValue = sip20years * 12 * ((Math.pow(1.12, 20) - 1) / 0.12); // 12% annual return
      
      recommendations.push({
        type: 'SIP Investment',
        target: futureValue,
        current: 0,
        monthly: sip20years,
        timeframe: '20 years',
        priority: 'Medium',
        description: `₹${Math.round(futureValue).toLocaleString()} in 20 years`
      });
    }

    // Debt-free wealth building
    const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
    if (totalDebt > 0) {
      const debtFreeDate = new Date();
      debtFreeDate.setMonth(debtFreeDate.getMonth() + Math.ceil(totalDebt / totalMinPayments));
      
      recommendations.push({
        type: 'Post Debt-Free Wealth',
        target: totalMinPayments * 12 * 10, // 10 years of current EMI amount
        current: 0,
        monthly: totalMinPayments,
        timeframe: `After ${debtFreeDate.toLocaleDateString()}`,
        priority: 'Future',
        description: 'Redirect EMI payments to wealth building post debt freedom'
      });
    }

    return recommendations;
  };

  const handleAddSaving = () => {
    if (!newSaving.amount || parseFloat(newSaving.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const entry: SavingEntry = {
      id: Date.now().toString(),
      amount: parseFloat(newSaving.amount),
      date: new Date().toISOString(),
      description: newSaving.description || 'Saving entry'
    };

    setSavingEntries([entry, ...savingEntries]);
    setNewSaving({ amount: '', description: '' });
    toast.success("Saving entry added successfully!");
  };

  const handleSaveGoal = () => {
    setSavingGoal(editGoal);
    setIsEditingGoal(false);
    toast.success("Saving goal updated!");
  };

  const recommendations = getIntelligentRecommendations();
  const goalProgress = savingGoal.target > 0 ? (totalSaved / savingGoal.target) * 100 : 0;
  const monthlyProgress = savingGoal.monthly > 0 ? (currentMonthSaved / savingGoal.monthly) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-800/30 border-green-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-5 w-5 text-green-400" />
              <h3 className="text-sm text-green-300">Available for Saving</h3>
            </div>
            <p className="text-xl font-bold text-green-400">₹{availableForSaving.toLocaleString()}</p>
            <p className="text-xs text-green-500">After EMI & Expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/30 border-blue-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm text-blue-300">Total Saved</h3>
            </div>
            <p className="text-xl font-bold text-blue-400">₹{totalSaved.toLocaleString()}</p>
            <p className="text-xs text-blue-500">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm text-purple-300">This Month</h3>
            </div>
            <p className="text-xl font-bold text-purple-400">₹{currentMonthSaved.toLocaleString()}</p>
            <p className="text-xs text-purple-500">Current month savings</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <h3 className="text-sm text-orange-300">Potential Extra</h3>
            </div>
            <p className="text-xl font-bold text-orange-400">₹{Math.max(0, availableForSaving - currentMonthSaved).toLocaleString()}</p>
            <p className="text-xs text-orange-500">Could save more</p>
          </CardContent>
        </Card>
      </div>

      {/* Saving Goal */}
      <Card className="bg-cyan-800/30 border-cyan-600/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <Target className="h-6 w-6 text-cyan-300" />
              Saving Goal
            </CardTitle>
            <Button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              variant="outline"
              size="sm"
              className="bg-cyan-800/50 border-cyan-600 text-cyan-200"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingGoal ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-cyan-200">Monthly Target</Label>
                <Input
                  type="number"
                  value={editGoal.monthly}
                  onChange={(e) => setEditGoal({...editGoal, monthly: parseFloat(e.target.value) || 0})}
                  className="bg-cyan-800/50 border-cyan-600 text-cyan-100"
                />
              </div>
              <div>
                <Label className="text-cyan-200">Total Target</Label>
                <Input
                  type="number"
                  value={editGoal.target}
                  onChange={(e) => setEditGoal({...editGoal, target: parseFloat(e.target.value) || 0})}
                  className="bg-cyan-800/50 border-cyan-600 text-cyan-100"
                />
              </div>
              <div>
                <Label className="text-cyan-200">Purpose</Label>
                <Input
                  value={editGoal.purpose}
                  onChange={(e) => setEditGoal({...editGoal, purpose: e.target.value})}
                  className="bg-cyan-800/50 border-cyan-600 text-cyan-100"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveGoal} className="bg-green-600 hover:bg-green-500">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setIsEditingGoal(false)} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-200">{savingGoal.purpose}</span>
                <Badge className="bg-cyan-600">₹{savingGoal.monthly.toLocaleString()}/month</Badge>
              </div>
              <Progress value={goalProgress} className="mb-2 bg-cyan-900/50" />
              <div className="flex justify-between text-sm text-cyan-300">
                <span>₹{totalSaved.toLocaleString()} saved</span>
                <span>₹{savingGoal.target.toLocaleString()} target</span>
              </div>
              <Progress value={monthlyProgress} className="mt-2 bg-cyan-800/50" />
              <p className="text-xs text-cyan-400 mt-1">This month: ₹{currentMonthSaved.toLocaleString()} / ₹{savingGoal.monthly.toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Saving Entry */}
      <Card className="bg-green-800/30 border-green-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-100">
            <Plus className="h-6 w-6 text-green-300" />
            Add Saving Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-green-200">Amount</Label>
              <Input
                type="number"
                value={newSaving.amount}
                onChange={(e) => setNewSaving({...newSaving, amount: e.target.value})}
                className="bg-green-800/50 border-green-600 text-green-100"
                placeholder="5000"
              />
            </div>
            <div className="flex-1">
              <Label className="text-green-200">Description</Label>
              <Input
                value={newSaving.description}
                onChange={(e) => setNewSaving({...newSaving, description: e.target.value})}
                className="bg-green-800/50 border-green-600 text-green-100"
                placeholder="Bonus saving"
              />
            </div>
            <Button onClick={handleAddSaving} className="bg-green-600 hover:bg-green-500">
              Add Saving
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Intelligent Recommendations */}
      <Card className="bg-indigo-800/30 border-indigo-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <TrendingUp className="h-6 w-6 text-indigo-300" />
            Intelligent Wealth Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-indigo-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-indigo-200">{rec.type}</h3>
                <Badge className={`${rec.priority === 'High' ? 'bg-red-600' : rec.priority === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                  {rec.priority}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-indigo-300">Monthly:</span>
                  <p className="text-indigo-100">₹{rec.monthly.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-indigo-300">Target:</span>
                  <p className="text-indigo-100">₹{rec.target.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-indigo-300">Timeframe:</span>
                  <p className="text-indigo-100">{rec.timeframe}</p>
                </div>
                <div>
                  <span className="text-indigo-300">Progress:</span>
                  <p className="text-indigo-100">{Math.round((rec.current / rec.target) * 100)}%</p>
                </div>
              </div>
              {rec.description && (
                <p className="text-indigo-300 text-sm mt-2">{rec.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Savings */}
      <Card className="bg-teal-800/30 border-teal-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-teal-100">Recent Savings ({savingEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savingEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-teal-900/50 p-3 rounded">
                <div>
                  <p className="text-teal-100 font-medium">₹{entry.amount.toLocaleString()}</p>
                  <p className="text-teal-300 text-sm">{entry.description}</p>
                </div>
                <span className="text-teal-400 text-sm">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
            ))}
            {savingEntries.length === 0 && (
              <p className="text-teal-300 text-center py-4">No savings recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
