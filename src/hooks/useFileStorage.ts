
import { useState } from 'react';
import { toast } from "sonner";
import { FontSettings } from "@/components/FontControls";

interface StorageData {
  bankBalance: number;
  emergencyFund: number;
  emergencyGoal: number;
  accounts: any[];
  expenses: any[];
  paymentLogs: any[];
  undoStack: any[];
  colorTheme: string;
  fontSettings: FontSettings;
  spendingCategories: { [key: string]: number };
  insurancePolicies: any[];
}

export const useFileStorage = (dashboardName: string = 'debt-dashboard') => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = async (): Promise<StorageData | null> => {
    try {
      const savedData = localStorage.getItem('debtDashboardData');
      if (savedData) {
        const data = JSON.parse(savedData);
        toast.success("Data loaded from browser storage!");
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Error loading data from browser storage.");
      return null;
    }
  };

  const saveData = async (data: StorageData) => {
    try {
      localStorage.setItem('debtDashboardData', JSON.stringify(data));
      // Uncomment the line below if you want confirmation toasts
      // toast.success("Data saved to browser storage!");
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast.error("Error saving data to browser storage.");
    }
  };

  return { loadData, saveData, isLoaded, setIsLoaded };
};
