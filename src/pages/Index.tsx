
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Banknote, 
  CreditCard, 
  Plus, 
  Settings, 
  TrendingUp, 
  Calendar,
  PieChart,
  History,
  FileText,
  Trash2,
  Edit,
  Check,
  X,
  Undo,
  Redo,
  Target,
  Shield
} from "lucide-react";
import { BankBalanceCard } from "@/components/BankBalanceCard";
import { AccountsSection } from "@/components/AccountsSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { ChartsTab } from "@/components/ChartsTab";
import { HistoryTab } from "@/components/HistoryTab";
import { SettingsTab } from "@/components/SettingsTab";
import { SmartTips } from "@/components/SmartTips";
import { EmergencyFundCard } from "@/components/EmergencyFundCard";
import { ExpenseCategoriesTab } from "@/components/ExpenseCategoriesTab";

export interface Account {
  id: string;
  name: string;
  type: 'credit-card' | 'loan';
  outstanding: number;
  minPayment: number;
  interestRate: number;
  dueDate: string;
  lastPayment?: {
    amount: number;
    date: string;
    type: 'minimum' | 'full' | 'custom' | 'emi';
  };
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  type: 'recurring' | 'one-time';
  paymentMethod: string;
  isPaid: boolean;
  date: string;
  category: string;
}

export interface PaymentLog {
  id: string;
  accountId: string;
  accountName: string;
  amount: number;
  type: 'minimum' | 'full' | 'custom' | 'emi';
  date: string;
  balanceBefore: number;
  balanceAfter: number;
}

const Index = () => {
  const [bankBalance, setBankBalance] = useState(50000);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [emergencyGoal, setEmergencyGoal] = useState(150000);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [colorTheme, setColorTheme] = useState('ocean');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('debtDashboardData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBankBalance(data.bankBalance || 50000);
      setEmergencyFund(data.emergencyFund || 0);
      setEmergencyGoal(data.emergencyGoal || 150000);
      setAccounts(data.accounts || []);
      setExpenses(data.expenses || []);
      setPaymentLogs(data.paymentLogs || []);
      setUndoStack(data.undoStack || []);
      setColorTheme(data.colorTheme || 'ocean');
      toast.success("Data loaded successfully!");
    } else {
      // Initialize with sample data
      const sampleAccounts: Account[] = [
        {
          id: '1',
          name: 'HDFC Credit Card',
          type: 'credit-card',
          outstanding: 25000,
          minPayment: 1250,
          interestRate: 42,
          dueDate: '2025-07-15'
        },
        {
          id: '2',
          name: 'Home Loan',
          type: 'loan',
          outstanding: 1500000,
          minPayment: 18500,
          interestRate: 8.5,
          dueDate: '2025-07-05'
        }
      ];
      setAccounts(sampleAccounts);
      toast.success("Welcome! Sample data loaded.");
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      bankBalance,
      emergencyFund,
      emergencyGoal,
      accounts,
      expenses,
      paymentLogs,
      undoStack: undoStack.slice(-5),
      colorTheme,
    };
    localStorage.setItem('debtDashboardData', JSON.stringify(dataToSave));
  }, [bankBalance, emergencyFund, emergencyGoal, accounts, expenses, paymentLogs, undoStack, colorTheme]);

  const saveStateForUndo = () => {
    const currentState = {
      bankBalance,
      emergencyFund,
      accounts: [...accounts],
      expenses: [...expenses],
      paymentLogs: [...paymentLogs],
      timestamp: new Date().toISOString()
    };
    
    setUndoStack(prev => [...prev.slice(-4), currentState]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const currentState = {
        bankBalance,
        emergencyFund,
        accounts: [...accounts],
        expenses: [...expenses],
        paymentLogs: [...paymentLogs],
        timestamp: new Date().toISOString()
      };
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      setBankBalance(previousState.bankBalance);
      setEmergencyFund(previousState.emergencyFund);
      setAccounts(previousState.accounts);
      setExpenses(previousState.expenses);
      setPaymentLogs(previousState.paymentLogs);
      
      toast.success("Action undone");
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const currentState = {
        bankBalance,
        emergencyFund,
        accounts: [...accounts],
        expenses: [...expenses],
        paymentLogs: [...paymentLogs],
        timestamp: new Date().toISOString()
      };
      
      setUndoStack(prev => [...prev, currentState]);
      setRedoStack(prev => prev.slice(0, -1));
      
      setBankBalance(nextState.bankBalance);
      setEmergencyFund(nextState.emergencyFund);
      setAccounts(nextState.accounts);
      setExpenses(nextState.expenses);
      setPaymentLogs(nextState.paymentLogs);
      
      toast.success("Action redone");
    }
  };

  const getThemeClasses = () => {
    const themes = {
      ocean: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      forest: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900',
      sunset: 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900',
      lavender: 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900',
      midnight: 'bg-gradient-to-br from-gray-900 via-slate-800 to-black'
    };
    return themes[colorTheme as keyof typeof themes] || themes.ocean;
  };

  const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);

  return (
    <div className={`min-h-screen ${getThemeClasses()} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
            💰 FinTech Debt Master Pro
          </h1>
          <p className="text-slate-200 text-lg font-medium">Intelligent Debt Management & Financial Freedom Platform</p>
          
          {/* Undo/Redo buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/60 backdrop-blur-sm border-slate-600/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <FileText className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <Target className="h-4 w-4 mr-2" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Bank Balance */}
            <BankBalanceCard 
              balance={bankBalance} 
              onBalanceChange={(newBalance) => {
                saveStateForUndo();
                setBankBalance(newBalance);
              }} 
            />

            {/* Accounts Section */}
            <AccountsSection
              accounts={accounts}
              bankBalance={bankBalance}
              onAccountsChange={(newAccounts) => {
                saveStateForUndo();
                setAccounts(newAccounts);
              }}
              onPaymentMade={(payment) => {
                saveStateForUndo();
                setBankBalance(prev => prev - payment.amount);
                setPaymentLogs(prev => [...prev, payment]);
              }}
            />

            {/* Expenses Section */}
            <ExpensesSection
              expenses={expenses}
              bankBalance={bankBalance}
              accounts={accounts}
              onExpensesChange={(newExpenses) => {
                saveStateForUndo();
                setExpenses(newExpenses);
              }}
              onExpensePaid={(amount) => {
                saveStateForUndo();
                setBankBalance(prev => prev - amount);
              }}
              onExpenseAddedToCC={(accountId, amount) => {
                saveStateForUndo();
                const updatedAccounts = accounts.map(acc => {
                  if (acc.id === accountId && acc.type === 'credit-card') {
                    return {
                      ...acc,
                      outstanding: acc.outstanding + amount,
                      minPayment: Math.max(acc.minPayment, (acc.outstanding + amount) * 0.05)
                    };
                  }
                  return acc;
                });
                setAccounts(updatedAccounts);
              }}
              onExpenseRemoved={(expense) => {
                saveStateForUndo();
                if (expense.paymentMethod === 'bank') {
                  setBankBalance(prev => prev + expense.amount);
                } else {
                  const updatedAccounts = accounts.map(acc => {
                    if (acc.name === expense.paymentMethod && acc.type === 'credit-card') {
                      return {
                        ...acc,
                        outstanding: Math.max(0, acc.outstanding - expense.amount),
                        minPayment: Math.max(acc.minPayment, (acc.outstanding - expense.amount) * 0.05)
                      };
                    }
                    return acc;
                  });
                  setAccounts(updatedAccounts);
                }
              }}
            />

            {/* Smart Tips */}
            <SmartTips accounts={accounts} bankBalance={bankBalance} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsTab accounts={accounts} expenses={expenses} paymentLogs={paymentLogs} />
          </TabsContent>

          <TabsContent value="categories">
            <ExpenseCategoriesTab expenses={expenses} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab paymentLogs={paymentLogs} expenses={expenses} />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyFundCard 
              currentAmount={emergencyFund}
              targetAmount={emergencyGoal}
              bankBalance={bankBalance}
              onSave={(amount) => {
                saveStateForUndo();
                setEmergencyFund(prev => prev + amount);
                setBankBalance(prev => prev - amount);
              }}
              onGoalChange={(newGoal) => {
                setEmergencyGoal(newGoal);
              }}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              accounts={accounts}
              colorTheme={colorTheme}
              onAccountsChange={setAccounts}
              onColorThemeChange={setColorTheme}
              onDataReset={() => {
                setBankBalance(50000);
                setEmergencyFund(0);
                setAccounts([]);
                setExpenses([]);
                setPaymentLogs([]);
                setUndoStack([]);
                setRedoStack([]);
                toast.success("All data reset successfully");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
