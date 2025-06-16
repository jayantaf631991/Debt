
import { useState } from 'react';
import { toast } from "sonner";

interface UndoState {
  bankBalance: number;
  emergencyFund: number;
  accounts: any[];
  expenses: any[];
  paymentLogs: any[];
  timestamp: string;
}

export const useUndoRedo = () => {
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);

  const saveStateForUndo = (state: Omit<UndoState, 'timestamp'>) => {
    const currentState: UndoState = {
      ...state,
      timestamp: new Date().toISOString()
    };
    
    setUndoStack(prev => [...prev.slice(-4), currentState]);
    setRedoStack([]);
  };

  const handleUndo = (currentState: Omit<UndoState, 'timestamp'>) => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const stateToSave: UndoState = {
        ...currentState,
        timestamp: new Date().toISOString()
      };
      
      setRedoStack(prev => [...prev, stateToSave]);
      setUndoStack(prev => prev.slice(0, -1));
      
      toast.success("Action undone");
      return previousState;
    }
    return null;
  };

  const handleRedo = (currentState: Omit<UndoState, 'timestamp'>) => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const stateToSave: UndoState = {
        ...currentState,
        timestamp: new Date().toISOString()
      };
      
      setUndoStack(prev => [...prev, stateToSave]);
      setRedoStack(prev => prev.slice(0, -1));
      
      toast.success("Action redone");
      return nextState;
    }
    return null;
  };

  return {
    undoStack,
    redoStack,
    setUndoStack,
    saveStateForUndo,
    handleUndo,
    handleRedo
  };
};
