import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankSection } from "@/components/BankSection";
import { AccountsSection } from "@/components/AccountsSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { StoragePathDisplay } from "@/components/StoragePathDisplay";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { ImportExportTab } from "@/components/ImportExportTab";
import { IntegrationSettings } from "@/components/IntegrationSettings";
import { DebtBurndownTab } from "@/components/DebtBurndownTab";
import { 
  Home,
  PiggyBank,
  CreditCard,
  Receipt,
  BarChart3,
  History,
  TrendingUp,
  Upload,
  Settings,
  Calculator
} from "lucide-react";

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

// Simplified dummy data
const dummyAccounts: Account[] = [
  {
    id: '1',
    name: 'Credit Card',
    type: 'credit-card',
    outstanding: 25000,
    minPayment: 1250,
    interestRate: 24,
    dueDate: '2025-01-15'
  },
  {
    id: '2',
    name: 'Personal Loan',
    type: 'loan',
    outstanding: 100000,
    minPayment: 5000,
    interestRate: 12,
    dueDate: '2025-01-05'
  }
];

const dummyExpenses: Expense[] = [
  {
    id: 'e1',
    name: 'Electricity Bill',
    amount: 2000,
    type: 'recurring',
    paymentMethod: 'bank',
    isPaid: true,
    date: '2024-12-01T00:00:00Z',
    category: 'utilities'
  },
  {
    id: 'e2',
    name: 'Groceries',
    amount: 5000,
    type: 'one-time',
    paymentMethod: 'Credit Card',
    isPaid: true,
    date: '2024-12-15T00:00:00Z',
    category: 'food'
  }
];

const Index = () => {
  const [bankBalance, setBankBalance] = useState(50000);
  const [accounts, setAccounts] = useState<Account[]>(dummyAccounts);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(dummyExpenses);

  useEffect(() => {
    const storedBankBalance = localStorage.getItem('bankBalance');
    const storedAccounts = localStorage.getItem('accounts');
    const storedExpenses = localStorage.getItem('expenses');

    if (storedBankBalance) setBankBalance(parseFloat(storedBankBalance));
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
  }, []);

  useEffect(() => {
    localStorage.setItem('bankBalance', bankBalance.toString());
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [bankBalance, accounts, expenses]);

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

  // Calculate totals for overview
  const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);

  const handleDataImport = (importedData: any) => {
    if (importedData.accounts) {
      setAccounts(prev => [...prev, ...importedData.accounts]);
    }
    if (importedData.expenses) {
      setExpenses(prev => [...prev, ...importedData.expenses]);
    }
    if (importedData.paymentLogs) {
      setPaymentLogs(prev => [...prev, ...importedData.paymentLogs]);
    }
    if (importedData.bankBalance !== undefined) {
      setBankBalance(importedData.bankBalance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto p-4">
        <StoragePathDisplay />
        
        <h1 className="text-3xl font-bold text-purple-100 mb-6">Comprehensive Debt Management Dashboard</h1>
        
        {/* Quick Overview with updated styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg shadow border border-purple-600/50">
            <h3 className="text-sm text-purple-300">Bank Balance</h3>
            <p className="text-xl font-bold text-green-400">₹{bankBalance.toLocaleString()}</p>
          </div>
          <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg shadow border border-purple-600/50">
            <h3 className="text-sm text-purple-300">Total Outstanding</h3>
            <p className="text-xl font-bold text-red-400">₹{totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg shadow border border-purple-600/50">
            <h3 className="text-sm text-purple-300">Min Payments Due</h3>
            <p className="text-xl font-bold text-orange-400">₹{totalMinPayments.toLocaleString()}</p>
          </div>
        </div>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-purple-800/50 border border-purple-600/50 backdrop-blur-sm">
            <TabsTrigger value="bank" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <PiggyBank className="h-4 w-4" />
              Bank
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <CreditCard className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="burndown" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <Calculator className="h-4 w-4" />
              Burndown
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <Upload className="h-4 w-4" />
              Import/Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-purple-200 data-[state=active]:bg-purple-600/50">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank" className="mt-6">
            <BankSection 
              bankBalance={bankBalance}
              onBankBalanceChange={handleBankBalanceChange}
            />
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-6">
            <AccountsSection 
              accounts={accounts}
              bankBalance={bankBalance}
              onAccountsChange={handleAccountsChange}
              onPaymentMade={handlePaymentMade}
            />
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-6">
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

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab 
              accounts={accounts}
              expenses={expenses}
            />
          </TabsContent>

          <TabsContent value="burndown" className="mt-6">
            <DebtBurndownTab 
              accounts={accounts}
            />
          </TabsContent>

          <TabsContent value="import-export" className="mt-6">
            <ImportExportTab 
              accounts={accounts}
              expenses={expenses}
              paymentLogs={paymentLogs}
              bankBalance={bankBalance}
              onDataImport={handleDataImport}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <IntegrationSettings />
              
              <div className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-purple-100">Financial Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Available Balance:</span>
                    <span className="font-medium text-purple-100">₹{bankBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Debt:</span>
                    <span className="font-medium text-red-400">₹{totalOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Monthly Obligations:</span>
                    <span className="font-medium text-purple-100">₹{totalMinPayments.toLocaleString()}</span>
                  </div>
                  <hr className="border-purple-600/50" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-purple-200">Net Worth:</span>
                    <span className={bankBalance - totalOutstanding >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ₹{(bankBalance - totalOutstanding).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
