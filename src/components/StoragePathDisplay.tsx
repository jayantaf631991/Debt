
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Info } from "lucide-react";
import { toast } from "sonner";

export const StoragePathDisplay: React.FC = () => {
  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem('debtDashboardData');
      toast.success("All data cleared! Please refresh the page.");
    }
  };

  const handleExportToFile = () => {
    try {
      const data = localStorage.getItem('debtDashboardData');
      if (!data) {
        toast.error("No data to export!");
        return;
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debt-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported to file!");
    } catch (error) {
      toast.error("Failed to export data!");
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-800/40 to-blue-800/40 border-green-600/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-green-300" />
            <span className="text-green-200 text-sm">Storage:</span>
            <span className="text-green-100 font-mono text-sm">
              Browser Local Storage (No server required!)
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleExportToFile}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 h-8"
            >
              Export Backup
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleClearData}
              className="border-red-600 text-red-300 hover:bg-red-700/50 h-8"
            >
              Clear Data
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-green-300">
          <Info className="h-3 w-3" />
          Your data is stored safely in your browser. Use "Export Backup" to save a file copy.
        </div>
      </CardContent>
    </Card>
  );
};
