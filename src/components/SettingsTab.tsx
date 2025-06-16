
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Download, Upload, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/pages/Index";

interface SettingsTabProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
  onDataReset: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  accounts, 
  onAccountsChange, 
  onDataReset 
}) => {
  const [paymentStrategy, setPaymentStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const exportData = () => {
    const data = localStorage.getItem('debtDashboardData');
    if (!data) {
      toast.error("No data to export");
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debt_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        localStorage.setItem('debtDashboardData', JSON.stringify(importedData));
        window.location.reload(); // Reload to apply imported data
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const updateAccountInterestRate = (accountId: string, newRate: number) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === accountId ? { ...acc, interestRate: newRate } : acc
    );
    onAccountsChange(updatedAccounts);
    toast.success("Interest rate updated");
  };

  const getPaymentStrategyDescription = () => {
    if (paymentStrategy === 'avalanche') {
      return "Pay minimums on all debts, focus extra payments on highest interest rate debt first. Saves the most money in interest.";
    } else {
      return "Pay minimums on all debts, focus extra payments on smallest balance debt first. Provides psychological wins and motivation.";
    }
  };

  const getSuggestedPaymentOrder = () => {
    if (paymentStrategy === 'avalanche') {
      return [...accounts].sort((a, b) => b.interestRate - a.interestRate);
    } else {
      return [...accounts].sort((a, b) => a.outstanding - b.outstanding);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Strategy */}
      <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100">Payment Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-purple-200">Choose Your Strategy</Label>
            <Select value={paymentStrategy} onValueChange={(value: any) => setPaymentStrategy(value)}>
              <SelectTrigger className="bg-purple-800/50 border-purple-600 text-purple-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-purple-800 border-purple-600">
                <SelectItem value="avalanche">Debt Avalanche (Interest First)</SelectItem>
                <SelectItem value="snowball">Debt Snowball (Smallest First)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-purple-300 text-sm mt-2">{getPaymentStrategyDescription()}</p>
          </div>

          {accounts.length > 0 && (
            <div>
              <h3 className="font-semibold text-purple-100 mb-3">Suggested Payment Order:</h3>
              <div className="space-y-2">
                {getSuggestedPaymentOrder().map((account, index) => (
                  <div key={account.id} className="flex items-center justify-between bg-purple-700/30 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600 text-white">{index + 1}</Badge>
                      <div>
                        <p className="font-medium text-purple-100">{account.name}</p>
                        <p className="text-purple-300 text-sm">
                          {paymentStrategy === 'avalanche' 
                            ? `${account.interestRate}% interest` 
                            : `₹${account.outstanding.toLocaleString()} outstanding`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interest Rate Management */}
      <Card className="bg-indigo-800/30 border-indigo-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-indigo-100">Interest Rate Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between bg-indigo-700/30 p-4 rounded-lg">
              <div>
                <h3 className="font-semibold text-indigo-100">{account.name}</h3>
                <p className="text-indigo-300 text-sm">Current rate: {account.interestRate}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={account.interestRate.toString()}
                  className="w-24 bg-indigo-800/50 border-indigo-600 text-indigo-100"
                  step="0.1"
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    if (!isNaN(newRate) && newRate >= 0) {
                      updateAccountInterestRate(account.id, newRate);
                    }
                  }}
                />
                <span className="text-indigo-200">%</span>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <p className="text-indigo-300 text-center py-4">No accounts to manage</p>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="bg-cyan-800/30 border-cyan-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-100">App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-cyan-200">Auto-save Changes</Label>
              <p className="text-cyan-300 text-sm">Automatically save data to local storage</p>
            </div>
            <Switch 
              checked={autoSaveEnabled} 
              onCheckedChange={setAutoSaveEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-cyan-200">Notifications</Label>
              <p className="text-cyan-300 text-sm">Show success and error messages</p>
            </div>
            <Switch 
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-100">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-orange-800/50 border-orange-600 text-orange-200 hover:bg-orange-700/50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-orange-900 border-orange-600">
                <DialogHeader>
                  <DialogTitle className="text-orange-100">Import Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-orange-200">
                    Select a backup file to import. This will replace all current data.
                  </p>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="bg-orange-800/50 border-orange-600 text-orange-100"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-red-900 border-red-600">
                <DialogHeader>
                  <DialogTitle className="text-red-100 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Reset All Data
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-red-200">
                    This will permanently delete all your accounts, expenses, payment history, and settings. 
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsResetDialogOpen(false)}
                      className="bg-red-800/50 border-red-600 text-red-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        onDataReset();
                        setIsResetDialogOpen(false);
                      }}
                    >
                      Yes, Reset Everything
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-800/30 border-blue-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-100">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-700/30 p-3 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Regular Backups:</strong> Export your data monthly to keep a backup of your financial progress.
            </p>
          </div>
          <div className="bg-blue-700/30 p-3 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Strategy Switching:</strong> You can change between Avalanche and Snowball strategies anytime based on your motivation and financial situation.
            </p>
          </div>
          <div className="bg-blue-700/30 p-3 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Interest Rate Updates:</strong> Keep your interest rates current for accurate payment recommendations and savings calculations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
