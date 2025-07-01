
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

          <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-500/30">
            <h4 className="font-semibold text-indigo-100 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Backup Schedule
            </h4>
            <div className="space-y-2 text-indigo-200 text-sm">
              <div>• Startup: When app starts</div>
              <div>• Morning: 11:00 AM daily</div>
              <div>• Afternoon: 4:00 PM daily</div>
              <div>• Evening: 8:00 PM daily</div>
            </div>
            <div className="mt-3 p-2 bg-indigo-800/50 rounded text-indigo-100 text-sm">
              <strong>Next backup:</strong> {nextBackupTime.toLocaleString()}
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

          <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-300 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-100 mb-2">Important Notes</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Backups will be downloaded to your Downloads folder</li>
                  <li>• The folder path is for reference only</li>
                  <li>• Move downloaded files to your preferred location</li>
                  <li>• Keep your browser open for scheduled backups</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
