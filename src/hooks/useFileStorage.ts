
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const SERVER_URL = 'http://localhost:3001';

interface FileStorageHook {
  loadData: () => Promise<any>;
  saveData: (data: any) => Promise<void>;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  serverConnected: boolean;
}

export const useFileStorage = (appType: 'debt-tool' | 'attendify' = 'debt-tool'): FileStorageHook => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);

  const checkServerConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/health`);
      const connected = response.ok;
      setServerConnected(connected);
      return connected;
    } catch (error) {
      setServerConnected(false);
      return false;
    }
  };

  const loadData = useCallback(async () => {
    try {
      const connected = await checkServerConnection();
      if (!connected) {
        toast.error('Server not connected. Please start the local server.');
        return null;
      }

      const response = await fetch(`${SERVER_URL}/api/${appType}/load`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        toast.error('Failed to load data from server');
        return null;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to connect to local server. Make sure it\'s running on port 3001.');
      setServerConnected(false);
      return null;
    }
  }, [appType]);

  const saveData = useCallback(async (data: any) => {
    try {
      const connected = await checkServerConnection();
      if (!connected) {
        toast.error('Server not connected. Data not saved.');
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/${appType}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Data saved successfully!');
      } else {
        toast.error('Failed to save data to server');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data to local server.');
      setServerConnected(false);
    }
  }, [appType]);

  return {
    loadData,
    saveData,
    isLoaded,
    setIsLoaded,
    serverConnected
  };
};
