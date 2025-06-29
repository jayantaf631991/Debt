
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, FileText, FileSpreadsheet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Account, Expense, PaymentLog } from "@/pages/Index";

interface ImportExportTabProps {
  accounts: Account[];
  expenses: Expense[];
  paymentLogs: PaymentLog[];
  bankBalance: number;
  onDataImport: (data: any) => void;
}

export const ImportExportTab: React.FC<ImportExportTabProps> = ({
  accounts,
  expenses,
  paymentLogs,
  bankBalance,
  onDataImport
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);

  const handleExportData = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        accounts,
        expenses,
        paymentLogs,
        bankBalance
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'json' | 'csv' | 'pdf' | 'excel') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (fileType === 'json') {
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setImportPreview(importedData);
          toast.success("File parsed successfully! Review the preview.");
        } catch (error) {
          toast.error("Invalid JSON file format");
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'csv') {
      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        // Simple CSV parsing - in production, use a proper CSV parser
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {} as any);
        }).filter(row => Object.values(row).some(val => val !== ''));
        
        setImportPreview({ csvData: parsedData, type: 'csv' });
        toast.success("CSV file parsed! Review the data.");
      };
      reader.readAsText(file);
    } else {
      toast.info(`${fileType.toUpperCase()} parsing is not yet implemented. This feature will extract financial data automatically.`);
    }
  };

  const handleImportConfirm = () => {
    if (importPreview) {
      if (importPreview.data) {
        onDataImport(importPreview.data);
      } else if (importPreview.csvData) {
        // Convert CSV data to our format - this is a simplified example
        const newExpenses = importPreview.csvData.map((row: any, index: number) => ({
          id: `imported-${Date.now()}-${index}`,
          name: row.description || row.name || 'Imported Expense',
          amount: parseFloat(row.amount || row.debit || '0'),
          type: 'one-time' as const,
          category: 'other',
          paymentMethod: 'bank' as const,
          isPaid: true,
          date: row.date || new Date().toISOString()
        }));
        
        onDataImport({ expenses: newExpenses });
      }
      
      setImportPreview(null);
      setIsImportDialogOpen(false);
      toast.success("Data imported successfully!");
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen p-6">
      <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <Download className="h-6 w-6 text-green-400" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-purple-200">Export all your dashboard data for backup or transfer</p>
          <Button 
            onClick={handleExportData}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Complete Dashboard Data
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <Upload className="h-6 w-6 text-blue-400" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <FileText className="h-8 w-8 text-blue-300 mx-auto" />
                  <h3 className="font-semibold text-purple-100">Dashboard Backup</h3>
                  <p className="text-sm text-purple-200">Import previously exported dashboard data</p>
                  <div>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'json')}
                      className="bg-purple-800 border-purple-600 text-purple-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-300 mx-auto" />
                  <h3 className="font-semibold text-purple-100">Bank Statements (CSV)</h3>
                  <p className="text-sm text-purple-200">Import expenses from bank CSV files</p>
                  <div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'csv')}
                      className="bg-purple-800 border-purple-600 text-purple-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <FileText className="h-8 w-8 text-red-300 mx-auto" />
                  <h3 className="font-semibold text-purple-100">PDF Statements</h3>
                  <p className="text-sm text-purple-200">Auto-extract data from PDF statements</p>
                  <div>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      className="bg-purple-800 border-purple-600 text-purple-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <FileSpreadsheet className="h-8 w-8 text-yellow-300 mx-auto" />
                  <h3 className="font-semibold text-purple-100">Excel Files</h3>
                  <p className="text-sm text-purple-200">Import from Excel spreadsheets</p>
                  <div>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'excel')}
                      className="bg-purple-800 border-purple-600 text-purple-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {importPreview && (
            <Card className="bg-purple-700/50 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-100">Import Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-800/50 p-4 rounded-lg">
                    <pre className="text-sm text-purple-200 overflow-auto max-h-40">
                      {JSON.stringify(importPreview, null, 2)}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleImportConfirm}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    >
                      Confirm Import
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setImportPreview(null)}
                      className="border-purple-600 text-purple-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-100 mb-2">Smart Data Extraction</h4>
                <ul className="text-purple-200 text-sm space-y-1">
                  <li>• PDF/Excel files will automatically extract: Total Due, Minimum Due, Interest Rate, Due Date</li>
                  <li>• CSV files will be categorized by transaction type and amount</li>
                  <li>• Preview before import to verify data accuracy</li>
                  <li>• Interest rates should be entered in monthly format (Annual ÷ 12)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
