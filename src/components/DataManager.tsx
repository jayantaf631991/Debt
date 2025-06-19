
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Power, Database, Shield } from "lucide-react";
import { toast } from "sonner";

interface DataManagerProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
  onQuitApp: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({
  onExportData,
  onImportData,
  onQuitApp
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onImportData(data);
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Invalid file format. Please select a valid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Database className="h-6 w-6 text-blue-300" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-700/30 border-blue-500/30">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Download className="h-12 w-12 text-blue-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-blue-100">Export Data</h3>
                  <p className="text-blue-200 text-sm">
                    Save all your dashboard data to a file for backup or transfer
                  </p>
                  <Button 
                    onClick={onExportData}
                    className="bg-blue-600 hover:bg-blue-500 text-white w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Dashboard Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-700/30 border-blue-500/30">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Upload className="h-12 w-12 text-blue-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-blue-100">Import Data</h3>
                  <p className="text-blue-200 text-sm">
                    Restore your dashboard from a previously exported backup file
                  </p>
                  <div>
                    <Label htmlFor="file-import" className="sr-only">Import file</Label>
                    <Input
                      id="file-import"
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="bg-blue-800/50 border-blue-600 text-blue-100 file:bg-blue-600 file:text-white file:border-0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-red-700/30 border-red-500/30">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Power className="h-12 w-12 text-red-300 mx-auto" />
                <h3 className="text-lg font-semibold text-red-100">Quit Application</h3>
                <p className="text-red-200 text-sm">
                  Save all data and safely close the application
                </p>
                <Button 
                  onClick={onQuitApp}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  <Power className="h-4 w-4 mr-2" />
                  Save & Quit Application
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-300 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-100 mb-2">Data Security Notice</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• All data is stored locally on your device</li>
                  <li>• Export files contain sensitive financial information</li>
                  <li>• Store backup files in a secure location</li>
                  <li>• Never share backup files with unauthorized persons</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
