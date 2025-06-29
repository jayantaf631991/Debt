
import { useState, useEffect } from 'react';
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

export const useLocalStorage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = (): StorageData | null => {
    const savedData = localStorage.getItem('debtDashboardData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        toast.success("Data loaded successfully!");
        return data;
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Error loading saved data");
        return null;
      }
    }
    return null;
  };

  const saveData = (data: StorageData) => {
    try {
      localStorage.setItem('debtDashboardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error("Error saving data");
    }
  };

  return { loadData, saveData, isLoaded, setIsLoaded };
};
