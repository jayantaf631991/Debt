import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { BankSection } from "@/components/BankSection";
import { AccountsSection } from "@/components/AccountsSection";
import { SpendingSection } from "@/components/SpendingSection";
import { InsightsSection } from "@/components/InsightsSection";
import { DataManager } from "@/components/DataManager";
import { ExpensesSection } from "@/components/ExpensesSection";
import { 
  BarChart3, 
  History, 
  Settings, 
  Shield, 
  Tag, 
  Home,
  BookOpen,
  Database,
  PiggyBank
} from "lucide-react";
import { toast } from "sonner";
import { JourneyTab } from "@/components/JourneyTab";

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

// Dummy data for testing
const dummyAccounts: Account[] = [
  {
    id: '1',
    name: 'HDFC Credit Card',
    type: 'credit-card',
    outstanding: 45000,
    minPayment: 2250,
    interestRate: 42,
    dueDate: '2025-01-15',
    lastPayment: {
      amount: 2250,
      date: '2024-12-15T00:00:00Z',
      type: 'minimum'
    }
  },
  {
    id: '2',
    name: 'SBI Personal Loan',
    type: 'loan',
    outstanding: 150000,
    minPayment: 8500,
    interestRate: 12,
    dueDate: '2025-01-05',
    lastPayment: {
      amount: 8500,
      date: '2024-12-05T00:00:00Z',
      type: 'emi'
    }
  },
  {
    id: '3',
    name: 'ICICI Credit Card',
    type: 'credit-card',
    outstanding: 25000,
    minPayment: 1250,
    interestRate: 36,
    dueDate: '2025-01-20',
  },
  {
    id: '4',
    name: 'Axis Bank Car Loan',
    type: 'loan',
    outstanding: 280000,
    minPayment: 12000,
    interestRate: 9.5,
    dueDate: '2025-01-10',
    lastPayment: {
      amount: 12000,
      date: '2024-12-10T00:00:00Z',
      type: 'emi'
    }
  }
];

const dummyPaymentLogs: PaymentLog[] = [
  {
    id: 'p1',
    accountId: '1',
    accountName: 'HDFC Credit Card',
    amount: 2250,
    type: 'minimum',
    date: '2024-12-15T00:00:00Z',
    balanceBefore: 102250,
    balanceAfter: 100000
  },
  {
    id: 'p2',
    accountId: '2',
    accountName: 'SBI Personal Loan',
    amount: 8500,
    type: 'emi',
    date: '2024-12-05T00:00:00Z',
    balanceBefore: 108500,
    balanceAfter: 100000
  },
  {
    id: 'p3',
    accountId: '4',
    accountName: 'Axis Bank Car Loan',
    amount: 12000,
    type: 'emi',
    date: '2024-12-10T00:00:00Z',
    balanceBefore: 112000,
    balanceAfter: 100000
  },
  {
    id: 'p4',
    accountId: '1',
    accountName: 'HDFC Credit Card',
    amount: 10000,
    type: 'custom',
    date: '2024-11-20T00:00:00Z',
    balanceBefore: 120000,
    balanceAfter: 110000
  },
  {
    id: 'p5',
    accountId: '3',
    accountName: 'ICICI Credit Card',
    amount: 15000,
    type: 'full',
    date: '2024-11-25T00:00:00Z',
    balanceBefore: 125000,
    balanceAfter: 110000
  }
];

const dummyExpenses: Expense[] = [
  {
    id: 'e1',
    name: 'Electricity Bill',
    amount: 3500,
    type: 'recurring',
    paymentMethod: 'bank',
    isPaid: true,
    date: '2024-12-01T00:00:00Z',
    category: 'utilities'
  },
  {
    id: 'e2',
    name: 'Grocery Shopping',
    amount: 8000,
    type: 'recurring',
    paymentMethod: 'HDFC Credit Card',
    isPaid: true,
    date: '2024-12-15T00:00:00Z',
    category: 'groceries'
  },
  {
    id: 'e3',
    name: 'Mobile Recharge',
    amount: 599,
    type: 'recurring',
    paymentMethod: 'bank',
    isPaid: true,
    date: '2024-12-10T00:00:00Z',
    category: 'utilities'
  },
  {
    id: 'e4',
    name: 'Movie Tickets',
    amount: 1200,
    type: 'one-time',
    paymentMethod: 'ICICI Credit Card',
    isPaid: true,
    date: '2024-12-18T00:00:00Z',
    category: 'entertainment'
  },
  {
    id: 'e5',
    name: 'Internet Bill',
    amount: 1500,
    type: 'recurring',
    paymentMethod: 'bank',
    isPaid: false,
    date: '2024-12-20T00:00:00Z',
    category: 'utilities'
  },
  {
    id: 'e6',
    name: 'Medical Checkup',
    amount: 2500,
    type: 'one-time',
    paymentMethod: 'bank',
    isPaid: false,
    date: '2024-12-22T00:00:00Z',
    category: 'healthcare'
  },
  {
    id: 'e7',
    name: 'Uber Rides',
    amount: 800,
    type: 'one-time',
    paymentMethod: 'HDFC Credit Card',
    isPaid: true,
    date: '2024-12-12T00:00:00Z',
    category: 'transport'
  },
  {
    id: 'e8',
    name: 'Online Course',
    amount: 4500,
    type: 'one-time',
    paymentMethod: 'bank',
    isPaid: false,
    date: '2024-12-25T00:00:00Z',
    category: 'education'
  }
];

const Index = () => {
  const [bankBalance, setBankBalance] = useState(100000);
  const [accounts, setAccounts] = useState<Account[]>(dummyAccounts);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>(dummyPaymentLogs);
  const [expenses, setExpenses] = useState<Expense[]>(dummyExpenses);
  const [spendingCategories, setSpendingCategories] = useState<{ [key: string]: number }>({
    "Food": 8000,
    "Travel": 12000,
    "Shopping": 6500,
    "Entertainment": 4500,
    "Utilities": 5500,
    "Healthcare": 3000,
    "Education": 4500,
    "Transport": 2500
  });

  useEffect(() => {
    // Load data from localStorage on component mount
    const storedBankBalance = localStorage.getItem('bankBalance');
    const storedAccounts = localStorage.getItem('accounts');
    const storedPaymentLogs = localStorage.getItem('paymentLogs');
    const storedSpendingCategories = localStorage.getItem('spendingCategories');

    if (storedBankBalance) setBankBalance(parseFloat(storedBankBalance));
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedPaymentLogs) setPaymentLogs(JSON.parse(storedPaymentLogs));
    if (storedSpendingCategories) setSpendingCategories(JSON.parse(storedSpendingCategories));
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('bankBalance', bankBalance.toString());
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('paymentLogs', JSON.stringify(paymentLogs));
    localStorage.setItem('spendingCategories', JSON.stringify(spendingCategories));
  }, [bankBalance, accounts, paymentLogs, spendingCategories]);

  const handleBankBalanceChange = (newBalance: number) => {
    setBankBalance(newBalance);
  };

  const handleAccountsChange = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
  };

  const handleExpensesChange = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  };

  const handlePaymentMade = (payment: PaymentLog) => {
    setPaymentLogs([...paymentLogs, payment]);
    setBankBalance(payment.balanceAfter);
  };

  const handleExpensePaid = (amount: number) => {
    setBankBalance(prev => prev - amount);
  };

  const handleExpenseAddedToCC = (accountId: string, amount: number) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, outstanding: acc.outstanding + amount }
        : acc
    );
    setAccounts(updatedAccounts);
  };

  const handleExpenseRemoved = (expense: Expense) => {
    if (expense.paymentMethod === 'bank' && expense.isPaid) {
      setBankBalance(prev => prev + expense.amount);
    } else if (expense.paymentMethod !== 'bank' && expense.isPaid) {
      const account = accounts.find(acc => acc.name === expense.paymentMethod);
      if (account?.type === 'credit-card') {
        const updatedAccounts = accounts.map(acc => 
          acc.id === account.id 
            ? { ...acc, outstanding: Math.max(0, acc.outstanding - expense.amount) }
            : acc
        );
        setAccounts(updatedAccounts);
      }
    }
  };

  const handleSpendingChange = (category: string, amount: number) => {
    setSpendingCategories(prev => ({ ...prev, [category]: amount }));
  };

  const handleExportData = () => {
    const data = {
      bankBalance,
      accounts,
      paymentLogs,
      spendingCategories
    };
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImportData = (data: any) => {
    try {
      setBankBalance(data.bankBalance || 0);
      setAccounts(data.accounts || []);
      setPaymentLogs(data.paymentLogs || []);
      setSpendingCategories(data.spendingCategories || {});
      toast.success("Data imported successfully!");
    } catch (error) {
      toast.error("Invalid file format. Please select a valid backup file.");
    }
  };

  const handleQuitApp = () => {
    localStorage.setItem('bankBalance', bankBalance.toString());
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('paymentLogs', JSON.stringify(paymentLogs));
    localStorage.setItem('spendingCategories', JSON.stringify(spendingCategories));
    toast.success("Data saved successfully!");
    // In a real Electron app, you'd use `window.close()` here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <Home className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="bank" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <PiggyBank className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bank</span>
          </TabsTrigger>

          <TabsTrigger 
            value="accounts" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <Tag className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="expenses" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>

          <TabsTrigger 
            value="journey" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Journey</span>
          </TabsTrigger>

          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="data" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>

          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <InsightsSection 
            accounts={accounts}
            paymentLogs={paymentLogs}
            spendingCategories={spendingCategories}
          />
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <BankSection 
            bankBalance={bankBalance}
            onBankBalanceChange={handleBankBalanceChange}
          />
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-4">
          <AccountsSection 
            accounts={accounts}
            bankBalance={bankBalance}
            onAccountsChange={handleAccountsChange}
            onPaymentMade={handlePaymentMade}
          />
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <ExpensesSection 
            expenses={expenses}
            bankBalance={bankBalance}
            accounts={accounts}
            onExpensesChange={handleExpensesChange}
            onExpensePaid={handleExpensePaid}
            onExpenseAddedToCC={handleExpenseAddedToCC}
            onExpenseRemoved={handleExpenseRemoved}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsSection 
            accounts={accounts}
            paymentLogs={paymentLogs}
            spendingCategories={spendingCategories}
          />
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <JourneyTab 
            accounts={accounts}
            expenses={expenses}
            bankBalance={bankBalance}
          />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataManager 
            onExportData={handleExportData}
            onImportData={handleImportData}
            onQuitApp={handleQuitApp}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Security Settings</h2>
          <p className="text-gray-400">Configure your security preferences here.</p>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400">Customize your dashboard experience.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
