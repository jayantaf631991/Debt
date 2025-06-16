import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BankBalanceCard } from "@/components/BankBalanceCard";
import { AccountsSection } from "@/components/AccountsSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { ChartsTab } from "@/components/ChartsTab";
import { HistoryTab } from "@/components/HistoryTab";
import { SettingsTab } from "@/components/SettingsTab";
import { SmartTips } from "@/components/SmartTips";
import { EmergencyFundCard } from "@/components/EmergencyFundCard";
import { ExpenseCategoriesTab } from "@/components/ExpenseCategoriesTab";
import { QuickStatsSection } from "@/components/QuickStatsSection";
import { HeaderSection } from "@/components/HeaderSection";
import { TabNavigation } from "@/components/TabNavigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { FontSettings } from "@/components/FontControls";

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [colorTheme, setColorTheme] = useState('ocean');
  
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    size: 14,
    family: 'Inter',
    weight: 'normal',
    color: 'white',
    italic: false
  });

  const { loadData, saveData } = useLocalStorage();
  const { 
    undoStack, 
    redoStack, 
    setUndoStack, 
    saveStateForUndo, 
    handleUndo, 
    handleRedo 
  } = useUndoRedo();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadData();
    if (savedData) {
      setBankBalance(savedData.bankBalance || 50000);
      setEmergencyFund(savedData.emergencyFund || 0);
      setEmergencyGoal(savedData.emergencyGoal || 150000);
      setAccounts(savedData.accounts || []);
      setExpenses(savedData.expenses || []);
      setPaymentLogs(savedData.paymentLogs || []);
      setUndoStack(savedData.undoStack || []);
      setColorTheme(savedData.colorTheme || 'ocean');
      setFontSettings(savedData.fontSettings || {
        size: 14,
        family: 'Inter',
        weight: 'normal',
        color: 'white',
        italic: false
      });
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
      fontSettings,
    };
    saveData(dataToSave);
  }, [bankBalance, emergencyFund, emergencyGoal, accounts, expenses, paymentLogs, undoStack, colorTheme, fontSettings]);

  const onUndo = () => {
    const previousState = handleUndo({
      bankBalance,
      emergencyFund,
      accounts: [...accounts],
      expenses: [...expenses],
      paymentLogs: [...paymentLogs]
    });
    
    if (previousState) {
      setBankBalance(previousState.bankBalance);
      setEmergencyFund(previousState.emergencyFund);
      setAccounts(previousState.accounts);
      setExpenses(previousState.expenses);
      setPaymentLogs(previousState.paymentLogs);
    }
  };

  const onRedo = () => {
    const nextState = handleRedo({
      bankBalance,
      emergencyFund,
      accounts: [...accounts],
      expenses: [...expenses],
      paymentLogs: [...paymentLogs]
    });
    
    if (nextState) {
      setBankBalance(nextState.bankBalance);
      setEmergencyFund(nextState.emergencyFund);
      setAccounts(nextState.accounts);
      setExpenses(nextState.expenses);
      setPaymentLogs(nextState.paymentLogs);
    }
  };

  const handleSaveStateForUndo = () => {
    saveStateForUndo({
      bankBalance,
      emergencyFund,
      accounts: [...accounts],
      expenses: [...expenses],
      paymentLogs: [...paymentLogs]
    });
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
        <HeaderSection 
          undoStack={undoStack}
          redoStack={redoStack}
          onUndo={onUndo}
          onRedo={onRedo}
          fontSettings={fontSettings}
          onFontChange={setFontSettings}
        />

        <QuickStatsSection 
          bankBalance={bankBalance}
          totalOutstanding={totalOutstanding}
          totalMinPayments={totalMinPayments}
          emergencyFund={emergencyFund}
          fontSettings={fontSettings}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabNavigation />

          <TabsContent value="dashboard" className="space-y-6">
            <BankBalanceCard 
              balance={bankBalance} 
              onBalanceChange={(newBalance) => {
                handleSaveStateForUndo();
                setBankBalance(newBalance);
              }}
              fontSettings={fontSettings}
            />

            <AccountsSection
              accounts={accounts}
              bankBalance={bankBalance}
              onAccountsChange={(newAccounts) => {
                handleSaveStateForUndo();
                setAccounts(newAccounts);
              }}
              onPaymentMade={(payment) => {
                handleSaveStateForUndo();
                setBankBalance(prev => prev - payment.amount);
                setPaymentLogs(prev => [...prev, payment]);
              }}
            />

            <ExpensesSection
              expenses={expenses}
              bankBalance={bankBalance}
              accounts={accounts}
              onExpensesChange={(newExpenses) => {
                handleSaveStateForUndo();
                setExpenses(newExpenses);
              }}
              onExpensePaid={(amount) => {
                handleSaveStateForUndo();
                setBankBalance(prev => prev - amount);
              }}
              onExpenseAddedToCC={(accountId, amount) => {
                handleSaveStateForUndo();
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
                handleSaveStateForUndo();
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
                handleSaveStateForUndo();
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
