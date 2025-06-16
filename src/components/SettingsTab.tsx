
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Trash2, Download, Upload, Palette, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/pages/Index";

interface SettingsTabProps {
  accounts: Account[];
  colorTheme: string;
  onAccountsChange: (accounts: Account[]) => void;
  onColorThemeChange: (theme: string) => void;
  onDataReset: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  accounts, 
  colorTheme,
  onAccountsChange, 
  onColorThemeChange,
  onDataReset 
}) => {
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    outstanding: '',
    minPayment: '',
    interestRate: '',
    dueDate: ''
  });

  const colorThemes = [
    { id: 'ocean', name: 'Ocean Blue', colors: 'from-slate-900 via-blue-900 to-indigo-900' },
    { id: 'forest', name: 'Forest Green', colors: 'from-emerald-900 via-teal-900 to-green-900' },
    { id: 'sunset', name: 'Sunset Orange', colors: 'from-orange-900 via-red-900 to-pink-900' },
    { id: 'lavender', name: 'Lavender Purple', colors: 'from-purple-900 via-violet-800 to-indigo-900' },
    { id: 'midnight', name: 'Midnight Black', colors: 'from-gray-900 via-slate-800 to-black' }
  ];

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account.id);
    setEditForm({
      name: account.name,
      outstanding: account.outstanding.toString(),
      minPayment: account.minPayment.toString(),
      interestRate: account.interestRate.toString(),
      dueDate: account.dueDate
    });
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === editingAccount) {
        return {
          ...acc,
          name: editForm.name,
          outstanding: parseFloat(editForm.outstanding),
          minPayment: parseFloat(editForm.minPayment),
          interestRate: parseFloat(editForm.interestRate),
          dueDate: editForm.dueDate
        };
      }
      return acc;
    });

    onAccountsChange(updatedAccounts);
    setEditingAccount(null);
    toast.success("Account updated successfully!");
  };

  const handleDeleteAccount = (accountId: string) => {
    onAccountsChange(accounts.filter(acc => acc.id !== accountId));
    toast.success("Account deleted successfully");
  };

  const handleExportData = () => {
    const data = {
      accounts,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.accounts && Array.isArray(data.accounts)) {
          onAccountsChange(data.accounts);
          toast.success("Data imported successfully!");
        } else {
          toast.error("Invalid file format");
        }
      } catch (error) {
        toast.error("Error reading file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Color Theme Settings */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Palette className="h-6 w-6 text-blue-400" />
            Appearance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-200 mb-3 block">Color Theme</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {colorThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={colorTheme === theme.id ? "default" : "outline"}
                  className={`h-16 justify-start ${colorTheme === theme.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => {
                    onColorThemeChange(theme.id);
                    toast.success(`Theme changed to ${theme.name}`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.colors}`}></div>
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Settings className="h-6 w-6 text-green-400" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-slate-700/50 border-slate-600/50">
              <CardContent className="p-4">
                {editingAccount === account.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-200">Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Outstanding</Label>
                        <Input
                          type="number"
                          value={editForm.outstanding}
                          onChange={(e) => setEditForm({...editForm, outstanding: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Min Payment/EMI</Label>
                        <Input
                          type="number"
                          value={editForm.minPayment}
                          onChange={(e) => setEditForm({...editForm, minPayment: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Interest Rate (%)</Label>
                        <Input
                          type="number"
                          value={editForm.interestRate}
                          onChange={(e) => setEditForm({...editForm, interestRate: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Due Date</Label>
                        <Input
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-slate-100"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-500">
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingAccount(null)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                        {account.name}
                        <Badge variant={account.type === 'credit-card' ? 'default' : 'secondary'}>
                          {account.type === 'credit-card' ? 'Card' : 'Loan'}
                        </Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-slate-400">Outstanding:</span>
                          <span className="text-slate-200 ml-2">₹{account.outstanding.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Min Payment:</span>
                          <span className="text-slate-200 ml-2">₹{account.minPayment.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Interest:</span>
                          <span className="text-slate-200 ml-2">{account.interestRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Due:</span>
                          <span className="text-slate-200 ml-2">{new Date(account.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        className="border-slate-600 text-slate-300"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="border-red-600 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {accounts.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">No accounts to manage</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <RefreshCw className="h-6 w-6 text-purple-400" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleExportData}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                className="bg-green-600 hover:bg-green-500 text-white w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Reset All Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-slate-300">
                    This will permanently delete all your accounts, expenses, and payment history. 
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={onDataReset}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-500"
                    >
                      Yes, Reset Everything
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">Privacy & Security</h4>
            <p className="text-slate-300 text-sm">
              ✅ All data is stored locally on your device<br/>
              ✅ No data is sent to external servers<br/>
              ✅ Your financial information remains completely private<br/>
              ✅ You can use this dashboard offline without internet
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
