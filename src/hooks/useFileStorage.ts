
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

const SERVER_URL = 'http://localhost:3001';

export const useFileStorage = (dashboardName: string = 'debt-dashboard') => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = async (): Promise<StorageData | null> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/load-data/${dashboardName}`);
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      
      if (Object.keys(data).length > 0) {
        toast.success("Data loaded successfully from file!");
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Error loading data from file. Using localStorage as fallback.");
      
      // Fallback to localStorage
      const savedData = localStorage.getItem('debtDashboardData');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }
      return null;
    }
  };

  const saveData = async (data: StorageData) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/save-data/${dashboardName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      // Also save to localStorage as backup
      localStorage.setItem('debtDashboardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to file:', error);
      toast.error("Error saving data to file. Saved to browser storage instead.");
      
      // Fallback to localStorage
      try {
        localStorage.setItem('debtDashboardData', JSON.stringify(data));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        toast.error("Error saving data");
      }
    }
  };

  return { loadData, saveData, isLoaded, setIsLoaded };
};
