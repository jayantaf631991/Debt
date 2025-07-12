
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Folder, Save, Info } from "lucide-react";
import { toast } from "sonner";

interface AutoBackupSettingsProps {
  onBackupFolderChange: (folder: string) => void;
  onManualBackup: (reason: string) => void;
  getNextBackupTime: () => Date;
}

export const AutoBackupSettings: React.FC<AutoBackupSettingsProps> = ({
  onBackupFolderChange,
  onManualBackup,
  getNextBackupTime
}) => {
  const [backupFolder, setBackupFolder] = useState('D:\\DebtDashboardBackups');
  const [nextBackupTime, setNextBackupTime] = useState<Date>(new Date());

  useEffect(() => {
    const stored = localStorage.getItem('autoBackupFolder');
    if (stored) {
      setBackupFolder(stored);
    }
    
    // Update next backup time every minute
    const interval = setInterval(() => {
      setNextBackupTime(getNextBackupTime());
    }, 60000);
    
    setNextBackupTime(getNextBackupTime());
    
    return () => clearInterval(interval);
  }, [getNextBackupTime]);

  const handleSaveFolder = () => {
    localStorage.setItem('autoBackupFolder', backupFolder);
    onBackupFolderChange(backupFolder);
    toast.success("Backup folder updated!");
  };

  const handleManualBackup = () => {
    onManualBackup('manual');
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-100">
          <Clock className="h-6 w-6 text-indigo-300" />
          Auto Backup Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="backup-folder" className="text-indigo-200">
              Backup Folder Path
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="backup-folder"
                value={backupFolder}
                onChange={(e) => setBackupFolder(e.target.value)}
                placeholder="D:\DebtDashboardBackups"
                className="bg-indigo-800/50 border-indigo-600 text-indigo-100"
              />
              <Button 
                onClick={handleSaveFolder}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-red-900/50 p-4 rounded-lg border border-red-500/30">
            <h4 className="font-semibold text-indigo-100 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auto Backup Status
            </h4>
            <div className="space-y-2 text-red-200 text-sm">
              <div>• Auto backup is DISABLED</div>
              <div>• Only manual backups are available</div>
              <div>• Use the manual backup button below</div>
            </div>
            <div className="mt-3 p-2 bg-red-800/50 rounded text-red-100 text-sm">
              <strong>Status:</strong> Manual backup mode only
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleManualBackup}
              className="bg-purple-600 hover:bg-purple-500 flex-1"
            >
              <Folder className="h-4 w-4 mr-2" />
              Create Manual Backup Now
            </Button>
          </div>

          <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-300 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-100 mb-2">Manual Backup Info</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Backups will be downloaded to your Downloads folder</li>
                  <li>• The folder path is for reference only</li>
                  <li>• Move downloaded files to your preferred location</li>
                  <li>• Remember to create backups manually when needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
