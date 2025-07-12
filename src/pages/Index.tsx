import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, CreditCard, PiggyBank, ListChecks, BarChart3, Lightbulb, Settings, Undo, Redo, Shield, Download, Save } from "lucide-react";
import { HeaderSection } from "@/components/HeaderSection";
import { QuickStatsSection } from "@/components/QuickStatsSection";
import { AccountsSection } from "@/components/AccountsSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { WealthCreationTab } from "@/components/WealthCreationTab";
import { InsightsSection } from "@/components/InsightsSection";
import { SmartTips } from "@/components/SmartTips";
import { FontControls, FontSettings } from "@/components/FontControls";
import { Layout } from "@/components/Layout";
import { useFileStorage } from "@/hooks/useFileStorage";
import { InsuranceSection, InsurancePolicy } from "@/components/InsuranceSection";
import { ImportExportTab } from "@/components/ImportExportTab";
import { StoragePathDisplay } from "@/components/StoragePathDisplay";
import { DataManager } from "@/components/DataManager";
import { useAutoBackup } from "@/hooks/useAutoBackup";
import { AutoBackupSettings } from "@/components/AutoBackupSettings";
import { BulkDataUpload } from "@/components/BulkDataUpload";
import { useElectronAPI } from "@/hooks/useElectronAPI";

export interface Account {
  id: string;
  name: string;
  type: 'credit-card' | 'card' | 'loan';
  outstanding: number;
  minPayment: number;
  interestRate: number;
  dueDate: string;
  creditLimit?: number;
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
  isPaid: boolean;
  dueDate: string;
  category: string;
  date: string;
  type: 'recurring' | 'one-time';
  paymentMethod: string;
}

export interface PaymentLog {
  id: string;
  accountId: string;
  accountName: string;
  amount: number;
  type: string;
  date: string;
  balanceBefore: number;
  balanceAfter: number;
}

const Index = () => {
  const { toast } = useToast();
  const { loadData, saveData, isLoaded, setIsLoaded } = useFileStorage('debt-dashboard');
  const { isElectron } = useElectronAPI();
  const [bankBalance, setBankBalance] = useState(50000);
  const [emergencyFund, setEmergencyFund] = useState(10000);
  const [emergencyGoal, setEmergencyGoal] = useState(25000);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [activeTab, setActiveTab] = useState("accounts");
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [colorTheme, setColorTheme] = useState("system");
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    size: 16,
    family: 'Inter',
    weight: 'normal',
    color: 'white',
    italic: false,
  });
  const [spendingCategories, setSpendingCategories] = useState<{ [key: string]: number }>({});
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [backupFolder, setBackupFolder] = useState('D:\\DebtDashboardBackups');

  // Manual backup only - auto backup disabled
  const createManualBackup = (reason: string) => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      backupReason: reason,
      data: {
        bankBalance,
        emergencyFund,
        emergencyGoal,
        accounts,
        expenses,
        paymentLogs,
        undoStack,
        colorTheme,
        fontSettings,
        spendingCategories,
        insurancePolicies,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-dashboard-manual-backup-${reason}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Manual backup created",
      description: `Backup saved: ${reason}`,
    });
  };

  const getNextBackupTime = () => {
    return new Date(); // Dummy function since auto backup is disabled
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("debtDashboardTheme") || "system";
    setColorTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);

    const storedFontSettings = localStorage.getItem("debtDashboardFontSettings");
    if (storedFontSettings) {
      setFontSettings(JSON.parse(storedFontSettings));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
    localStorage.setItem("debtDashboardTheme", colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem("debtDashboardFontSettings", JSON.stringify(fontSettings));
  }, [fontSettings]);

  useEffect(() => {
    const loadStoredData = async () => {
      const storedData = await loadData();
      if (storedData) {
        setBankBalance(storedData.bankBalance || 50000);
        setEmergencyFund(storedData.emergencyFund || 10000);
        setEmergencyGoal(storedData.emergencyGoal || 25000);
        setAccounts(storedData.accounts || []);
        setExpenses(storedData.expenses || []);
        setPaymentLogs(storedData.paymentLogs || []);
        setUndoStack(storedData.undoStack || []);
        setColorTheme(storedData.colorTheme || "system");
        setFontSettings(storedData.fontSettings || {
          size: 16,
          family: 'Inter',
          weight: 'normal',
          color: 'white',
          italic: false,
        });
        setSpendingCategories(storedData.spendingCategories || {});
        setInsurancePolicies(storedData.insurancePolicies || []);
      }
      setIsLoaded(true);
    };

    loadStoredData();
  }, []);

  // Auto-save functionality completely disabled

  const handleManualSave = () => {
    // Save to localStorage
    saveData({
      bankBalance,
      emergencyFund,
      emergencyGoal,
      accounts,
      expenses,
      paymentLogs,
      undoStack,
      colorTheme,
      fontSettings,
      spendingCategories,
      insurancePolicies,
    });

    // Export to file
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        bankBalance,
        emergencyFund,
        emergencyGoal,
        accounts,
        expenses,
        paymentLogs,
        colorTheme,
        fontSettings,
        spendingCategories,
        insurancePolicies,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-dashboard-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data saved successfully!",
      description: "Data saved to browser and exported to file.",
    });
  };

  const handlePaymentMade = (payment: PaymentLog) => {
    setBankBalance(payment.balanceAfter);
    setPaymentLogs([payment, ...paymentLogs]);
  };

  const handleExpensePaid = (amount: number) => {
    setBankBalance(prev => prev - amount);
  };

  const handleExpenseAddedToCC = (accountId: string, amount: number) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, outstanding: acc.outstanding + amount }
        : acc
    ));
  };

  const handleExpenseRemoved = (expense: Expense) => {
    if (expense.isPaid && expense.paymentMethod === 'bank') {
      setBankBalance(prev => prev + expense.amount);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[0];
      setRedoStack([
        {
          bankBalance,
          emergencyFund,
          emergencyGoal,
          accounts,
          expenses,
          paymentLogs,
        },
        ...redoStack,
      ]);
      setUndoStack(undoStack.slice(1));
      setBankBalance(previousState.bankBalance);
      setEmergencyFund(previousState.emergencyFund);
      setEmergencyGoal(previousState.emergencyGoal);
      setAccounts(previousState.accounts);
      setExpenses(previousState.expenses);
      setPaymentLogs(previousState.paymentLogs);
      toast({
        title: "Undo successful",
        description: "Reverted to previous state.",
      });
    } else {
      toast({
        title: "Nothing to undo",
        description: "No previous states available.",
      });
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack([
        {
          bankBalance,
          emergencyFund,
          accounts,
          expenses,
          paymentLogs,
        },
        ...undoStack,
      ]);
      setRedoStack(redoStack.slice(1));
      setBankBalance(nextState.bankBalance);
      setEmergencyFund(nextState.emergencyFund);
      setEmergencyGoal(nextState.emergencyGoal);
      setAccounts(nextState.accounts);
      setExpenses(nextState.expenses);
      setPaymentLogs(nextState.paymentLogs);
      toast({
        title: "Redo successful",
        description: "Advanced to next state.",
      });
    } else {
      toast({
        title: "Nothing to redo",
        description: "No future states available.",
      });
    }
  };

  const handleDataImport = (importedData: any) => {
    if (importedData.accounts) setAccounts(importedData.accounts);
    if (importedData.expenses) setExpenses([...expenses, ...importedData.expenses]);
    if (importedData.paymentLogs) setPaymentLogs([...paymentLogs, ...importedData.paymentLogs]);
    if (importedData.bankBalance) setBankBalance(importedData.bankBalance);
  };

  const handleExportData = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        bankBalance,
        emergencyFund,
        emergencyGoal,
        accounts,
        expenses,
        paymentLogs,
        colorTheme,
        fontSettings,
        spendingCategories,
        insurancePolicies,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-dashboard-complete-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Dashboard data exported successfully!",
    });
  };

  const handleQuitApp = () => {
    // Save all data before quitting
    saveData({
      bankBalance,
      emergencyFund,
      emergencyGoal,
      accounts,
      expenses,
      paymentLogs,
      undoStack,
      colorTheme,
      fontSettings,
      spendingCategories,
      insurancePolicies,
    });
    
    toast({
      title: "Data saved",
      description: "All data has been saved successfully. You can safely close the application.",
    });
  };

  const handleBulkAccountsImport = (newAccounts: Account[]) => {
    setAccounts(prevAccounts => [...prevAccounts, ...newAccounts]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto p-6 space-y-6">
          {!isElectron && <StoragePathDisplay />}
          
          {/* Manual Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleManualSave}
              className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8 py-3 text-lg font-semibold shadow-lg ${isElectron ? 'mb-4' : ''}`}
            >
              <Save className="h-5 w-5 mr-2" />
              {isElectron ? 'Save Data & Export (Ctrl+S)' : 'Save Data & Export'}
            </Button>
          </div>

          {/* Add Bulk Data Upload Component */}
          <BulkDataUpload onAccountsImport={handleBulkAccountsImport} />
          
          <HeaderSection 
            undoStack={undoStack}
            redoStack={redoStack}
            onUndo={handleUndo}
            onRedo={handleRedo}
            fontSettings={fontSettings}
            onFontChange={setFontSettings}
          />
          <QuickStatsSection
            bankBalance={bankBalance}
            emergencyFund={emergencyFund}
            expenses={expenses}
            accounts={accounts}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="accounts">
                <CreditCard className="h-4 w-4 mr-2" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <ListChecks className="h-4 w-4 mr-2" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="insurance">
                <Shield className="h-4 w-4 mr-2" />
                Insurance
              </TabsTrigger>
              <TabsTrigger value="wealth">
                <PiggyBank className="h-4 w-4 mr-2" />
                Wealth Creation
              </TabsTrigger>
              <TabsTrigger value="insights">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="data">
                <Download className="h-4 w-4 mr-2" />
                Import/Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <AccountsSection 
                accounts={accounts} 
                expenses={expenses}
                bankBalance={bankBalance}
                onAccountsChange={setAccounts}
                onPaymentMade={handlePaymentMade}
              />
            </TabsContent>

            <TabsContent value="expenses">
              <ExpensesSection 
                expenses={expenses} 
                bankBalance={bankBalance}
                accounts={accounts}
                onExpensesChange={setExpenses}
                onExpensePaid={handleExpensePaid}
                onExpenseAddedToCC={handleExpenseAddedToCC}
                onExpenseRemoved={handleExpenseRemoved}
              />
            </TabsContent>

            <TabsContent value="insurance">
              <InsuranceSection 
                policies={insurancePolicies}
                onPoliciesChange={setInsurancePolicies}
              />
            </TabsContent>

            <TabsContent value="wealth">
              <WealthCreationTab 
                accounts={accounts}
                expenses={expenses}
                bankBalance={bankBalance}
              />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsSection 
                accounts={accounts} 
                paymentLogs={paymentLogs}
                spendingCategories={spendingCategories}
              />
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-purple-200">Bank Balance</Label>
                        <Input
                          type="number"
                          value={bankBalance}
                          onChange={(e) => setBankBalance(Number(e.target.value))}
                          className="bg-purple-800/50 border-purple-600 text-purple-100"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Emergency Fund</Label>
                        <Input
                          type="number"
                          value={emergencyFund}
                          onChange={(e) => setEmergencyFund(Number(e.target.value))}
                          className="bg-purple-800/50 border-purple-600 text-purple-100"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Emergency Goal</Label>
                        <Input
                          type="number"
                          value={emergencyGoal}
                          onChange={(e) => setEmergencyGoal(Number(e.target.value))}
                          className="bg-purple-800/50 border-purple-600 text-purple-100"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-800/30 border-blue-600/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-blue-200 text-lg font-semibold">Manual Save Only</Label>
                        <p className="text-blue-300 text-sm mt-1">
                          Auto-save has been disabled. Use the "Save Data & Export" button to save your changes.
                        </p>
                      </div>
                      <div className="bg-blue-900/50 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm">
                          💾 Manual save mode is active - Remember to save your changes regularly using the save button.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <FontControls 
                fontSettings={fontSettings} 
                onFontChange={setFontSettings}
              />
              <AutoBackupSettings
                onBackupFolderChange={setBackupFolder}
                onManualBackup={createManualBackup}
                getNextBackupTime={getNextBackupTime}
              />
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-6">
                <ImportExportTab
                  accounts={accounts}
                  expenses={expenses}
                  paymentLogs={paymentLogs}
                  bankBalance={bankBalance}
                  onDataImport={handleDataImport}
                />
                <DataManager
                  onExportData={handleExportData}
                  onImportData={handleDataImport}
                  onQuitApp={handleQuitApp}
                />
              </div>
            </TabsContent>
          </Tabs>

          <SmartTips accounts={accounts} bankBalance={bankBalance} />

          <div className="flex justify-between">
            <Button onClick={handleUndo} disabled={undoStack.length === 0} variant="secondary">
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button onClick={handleRedo} disabled={redoStack.length === 0} variant="secondary">
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;