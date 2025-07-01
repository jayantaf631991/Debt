
import { useEffect, useRef } from 'react';
import { toast } from "sonner";

interface BackupData {
  bankBalance: number;
  emergencyFund: number;
  emergencyGoal: number;
  accounts: any[];
  expenses: any[];
  paymentLogs: any[];
  undoStack: any[];
  colorTheme: string;
  fontSettings: any;
  spendingCategories: { [key: string]: number };
  insurancePolicies: any[];
}

interface UseAutoBackupProps {
  data: BackupData;
  backupFolder?: string;
}

export const useAutoBackup = ({ data, backupFolder = 'D:\\DebtDashboardBackups' }: UseAutoBackupProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartupBackup = useRef(false);

  const createBackup = async (reason: string) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        backupReason: reason,
        data: data
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debt-dashboard-auto-backup-${reason}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Auto backup created: ${reason} at ${new Date().toLocaleString()}`);
      toast.success(`Auto backup created: ${reason}`, {
        description: `Backup saved at ${new Date().toLocaleTimeString()}`
      });
    } catch (error) {
      console.error('Auto backup failed:', error);
      toast.error(`Auto backup failed: ${reason}`);
    }
  };

  const getNextBackupTime = () => {
    const now = new Date();
    const backupTimes = [11, 16, 20]; // 11am, 4pm, 8pm
    
    for (const hour of backupTimes) {
      const backupTime = new Date(now);
      backupTime.setHours(hour, 0, 0, 0);
      
      if (backupTime > now) {
        return backupTime;
      }
    }
    
    // If all times have passed today, schedule for 11am tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow;
  };

  const scheduleNextBackup = () => {
    const nextTime = getNextBackupTime();
    const msUntilNext = nextTime.getTime() - Date.now();
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    
    intervalRef.current = setTimeout(() => {
      const hour = nextTime.getHours();
      let reason = '';
      
      if (hour === 11) reason = 'morning';
      else if (hour === 16) reason = 'afternoon';
      else if (hour === 20) reason = 'evening';
      
      createBackup(reason);
      scheduleNextBackup(); // Schedule the next one
    }, msUntilNext);
    
    console.log(`Next auto backup scheduled for: ${nextTime.toLocaleString()}`);
  };

  useEffect(() => {
    // Create startup backup (only once)
    if (!hasStartupBackup.current) {
      createBackup('startup');
      hasStartupBackup.current = true;
    }
    
    // Schedule regular backups
    scheduleNextBackup();
    
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Re-schedule when data changes (to ensure we're backing up current data)
  useEffect(() => {
    // Don't create backup on every data change, just ensure scheduler is running
    if (!intervalRef.current) {
      scheduleNextBackup();
    }
  }, [data]);

  return {
    createManualBackup: (reason: string) => createBackup(reason),
    getNextBackupTime,
  };
};
