
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/pages/Index";

interface BulkDataUploadProps {
  onAccountsImport: (accounts: Account[]) => void;
}

export const BulkDataUpload: React.FC<BulkDataUploadProps> = ({ onAccountsImport }) => {
  const [jsonData, setJsonData] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sampleTemplate = {
    accounts: [
      {
        name: "Axis Bank-Credit Card",
        type: "credit-card",
        outstanding: 590000,
        minPayment: 14100,
        interestRate: 3.75,
        dueDate: "2025-01-15",
        creditLimit: 600000
      },
      {
        name: "SBI_17_50000",
        type: "credit-card", 
        outstanding: 24371,
        minPayment: 1219,
        interestRate: 3.99,
        dueDate: "2025-01-13",
        creditLimit: 50000
      },
      {
        name: "SBI_35 50000",
        type: "credit-card",
        outstanding: 40387,
        minPayment: 2019,
        interestRate: 3.99,
        dueDate: "2025-01-13", 
        creditLimit: 50000
      },
      {
        name: "ICICI 60000",
        type: "credit-card",
        outstanding: 66770,
        minPayment: 6700,
        interestRate: 3.12,
        dueDate: "2025-01-17",
        creditLimit: 60000
      },
      {
        name: "One Card",
        type: "credit-card",
        outstanding: 270554,
        minPayment: 19253,
        interestRate: 3.75,
        dueDate: "2025-01-03",
        creditLimit: 300000
      },
      {
        name: "Axis PL",
        type: "loan",
        outstanding: 370575,
        minPayment: 32985,
        interestRate: 11.5,
        dueDate: "2025-01-05"
      },
      {
        name: "Aditya Birla",
        type: "loan", 
        outstanding: 504553,
        minPayment: 19012,
        interestRate: 14.49,
        dueDate: "2025-01-06"
      },
      {
        name: "TATA",
        type: "loan",
        outstanding: 355000,
        minPayment: 4728,
        interestRate: 14.55,
        dueDate: "2025-01-05"
      }
    ]
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debt-dashboard-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Template downloaded successfully!");
  };

  const handleImportData = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      if (!parsedData.accounts || !Array.isArray(parsedData.accounts)) {
        toast.error("Invalid format. Please ensure 'accounts' array exists.");
        return;
      }

      const accounts: Account[] = parsedData.accounts.map((acc: any, index: number) => ({
        id: `imported-${Date.now()}-${index}`,
        name: acc.name || `Account ${index + 1}`,
        type: acc.type === 'loan' ? 'loan' : 'credit-card',
        outstanding: parseFloat(acc.outstanding) || 0,
        minPayment: parseFloat(acc.minPayment) || 0,
        interestRate: parseFloat(acc.interestRate) || 0,
        dueDate: acc.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creditLimit: acc.creditLimit ? parseFloat(acc.creditLimit) : undefined
      }));

      onAccountsImport(accounts);
      setJsonData('');
      setIsDialogOpen(false);
      toast.success(`${accounts.length} accounts imported successfully!`);
    } catch (error) {
      toast.error("Invalid JSON format. Please check your data.");
    }
  };

  const handleLoadSampleData = () => {
    const accounts: Account[] = sampleTemplate.accounts.map((acc, index) => ({
      id: `sample-${Date.now()}-${index}`,
      name: acc.name,
      type: acc.type as 'credit-card' | 'loan',
      outstanding: acc.outstanding,
      minPayment: acc.minPayment,
      interestRate: acc.interestRate,
      dueDate: acc.dueDate,
      creditLimit: acc.creditLimit
    }));

    onAccountsImport(accounts);
    toast.success("Sample data loaded successfully!");
  };

  return (
    <Card className="bg-blue-800/30 border-blue-600/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-100">
          <Upload className="h-6 w-6 text-blue-400" />
          Bulk Data Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={handleDownloadTemplate}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON Data
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-purple-900 border-purple-600 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-purple-100">Import Account Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your JSON data here..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="min-h-64 bg-purple-800/50 border-purple-600 text-purple-100"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleImportData}
                    disabled={!jsonData.trim()}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Import Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-purple-600 text-purple-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleLoadSampleData}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
        </div>

        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">JSON Template Format</h4>
              <div className="text-blue-200 text-sm space-y-1">
                <p>• Download the template to see the exact format required</p>
                <p>• Supported account types: "credit-card" or "loan"</p>
                <p>• Interest rates should be in monthly percentage (Annual ÷ 12)</p>
                <p>• Dates should be in YYYY-MM-DD format</p>
                <p>• Credit limit is optional for credit cards</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
