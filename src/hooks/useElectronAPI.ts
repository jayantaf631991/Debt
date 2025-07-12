import { useEffect } from 'react';

interface ElectronAPI {
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  onMenuSaveData: (callback: () => void) => void;
  onMenuExportData: (callback: () => void) => void;
  onMenuUndo: (callback: () => void) => void;
  onMenuRedo: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useElectronAPI = () => {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  return {
    isElectron,
    electronAPI: window.electronAPI
  };
};

export const useElectronMenuHandlers = (handlers: {
  onSave?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}) => {
  const { isElectron, electronAPI } = useElectronAPI();

  useEffect(() => {
    if (!isElectron || !electronAPI) return;

    if (handlers.onSave) {
      electronAPI.onMenuSaveData(handlers.onSave);
    }
    if (handlers.onExport) {
      electronAPI.onMenuExportData(handlers.onExport);
    }
    if (handlers.onUndo) {
      electronAPI.onMenuUndo(handlers.onUndo);
    }
    if (handlers.onRedo) {
      electronAPI.onMenuRedo(handlers.onRedo);
    }

    return () => {
      electronAPI.removeAllListeners('menu-save-data');
      electronAPI.removeAllListeners('menu-export-data');
      electronAPI.removeAllListeners('menu-undo');
      electronAPI.removeAllListeners('menu-redo');
    };
  }, [isElectron, electronAPI, handlers]);
};