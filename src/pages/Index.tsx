import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { BankSection } from "@/components/BankSection";
import { AccountsSection } from "@/components/AccountsSection";
import { SpendingSection } from "@/components/SpendingSection";
import { InsightsSection } from "@/components/InsightsSection";
import { DataManager } from "@/components/DataManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Index = () => {
  const [bankBalance, setBankBalance] = useState(100000);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [spendingCategories, setSpendingCategories] = useState<{ [key: string]: number }>({
    "Food": 5000,
    "Travel": 12000,
    "Shopping": 8000,
    "Entertainment": 4000
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

  const handlePaymentMade = (payment: PaymentLog) => {
    setPaymentLogs([...paymentLogs, payment]);
    setBankBalance(payment.balanceAfter);
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
    <Layout>
      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/10 backdrop-blur-sm border border-white/20">
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
            value="spending" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Spending</span>
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
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">Welcome to your personal finance dashboard</p>
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
        
        <TabsContent value="spending" className="space-y-4">
          <SpendingSection 
            spendingCategories={spendingCategories}
            onSpendingChange={handleSpendingChange}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsSection 
            accounts={accounts} 
            paymentLogs={paymentLogs} 
            spendingCategories={spendingCategories} 
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
    </Layout>
  );
};

export default Index;
