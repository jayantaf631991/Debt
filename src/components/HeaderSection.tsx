
import React from 'react';
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

interface HeaderSectionProps {
  undoStack: any[];
  redoStack: any[];
  onUndo: () => void;
  onRedo: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  undoStack,
  redoStack,
  onUndo,
  onRedo
}) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
        💰 FinTech Debt Master Pro
      </h1>
      <p className="text-slate-200 text-lg font-medium">Intelligent Debt Management & Financial Freedom Platform</p>
      
      {/* Undo/Redo buttons */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={undoStack.length === 0}
          className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
        >
          <Undo className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={redoStack.length === 0}
          className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
        >
          <Redo className="h-4 w-4 mr-1" />
          Redo
        </Button>
      </div>
    </div>
  );
};
