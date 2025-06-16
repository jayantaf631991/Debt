
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
  Redo
} from "lucide-react";
import { BankBalanceCard } from "@/components/BankBalanceCard";
import { AccountsSection } from "@/components/AccountsSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { ChartsTab } from "@/components/ChartsTab";
import { HistoryTab } from "@/components/HistoryTab";
import { SettingsTab } from "@/components/SettingsTab";
import { SmartTips } from "@/components/SmartTips";

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
    type: 'minimum' | 'full' | 'custom';
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
  type: 'minimum' | 'full' | 'custom';
  date: string;
  balanceBefore: number;
  balanceAfter: number;
}

const Index = () => {
  const [bankBalance, setBankBalance] = useState(50000);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('debtDashboardData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBankBalance(data.bankBalance || 50000);
      setAccounts(data.accounts || []);
      setExpenses(data.expenses || []);
      setPaymentLogs(data.paymentLogs || []);
      setUndoStack(data.undoStack || []);
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
      accounts,
      expenses,
      paymentLogs,
      undoStack: undoStack.slice(-5), // Keep only last 5 undo states
    };
    localStorage.setItem('debtDashboardData', JSON.stringify(dataToSave));
  }, [bankBalance, accounts, expenses, paymentLogs, undoStack]);

  const saveStateForUndo = () => {
    const currentState = {
      bankBalance,
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
        accounts: [...accounts],
        expenses: [...expenses],
        paymentLogs: [...paymentLogs],
        timestamp: new Date().toISOString()
      };
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      setBankBalance(previousState.bankBalance);
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
        accounts: [...accounts],
        expenses: [...expenses],
        paymentLogs: [...paymentLogs],
        timestamp: new Date().toISOString()
      };
      
      setUndoStack(prev => [...prev, currentState]);
      setRedoStack(prev => prev.slice(0, -1));
      
      setBankBalance(nextState.bankBalance);
      setAccounts(nextState.accounts);
      setExpenses(nextState.expenses);
      setPaymentLogs(nextState.paymentLogs);
      
      toast.success("Action redone");
    }
  };

  const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            💰 Debt Mastery Dashboard
          </h1>
          <p className="text-purple-200">Take control of your financial future with intelligent debt management</p>
          
          {/* Undo/Redo buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="bg-purple-800/50 border-purple-600 text-purple-200 hover:bg-purple-700/50"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="bg-purple-800/50 border-purple-600 text-purple-200 hover:bg-purple-700/50"
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Bank Balance</p>
                  <p className="text-2xl font-bold text-green-100">₹{bankBalance.toLocaleString()}</p>
                </div>
                <Banknote className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm">Total Outstanding</p>
                  <p className="text-2xl font-bold text-red-100">₹{totalOutstanding.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Min Payments Due</p>
                  <p className="text-2xl font-bold text-blue-100">₹{totalMinPayments.toLocaleString()}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-800/50 backdrop-blur-sm border-purple-600/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <PieChart className="h-4 w-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
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
            />

            {/* Smart Tips */}
            <SmartTips accounts={accounts} bankBalance={bankBalance} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsTab accounts={accounts} expenses={expenses} paymentLogs={paymentLogs} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab paymentLogs={paymentLogs} expenses={expenses} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              accounts={accounts}
              onAccountsChange={setAccounts}
              onDataReset={() => {
                setBankBalance(50000);
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
