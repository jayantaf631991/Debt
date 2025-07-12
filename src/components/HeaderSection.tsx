
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Undo, Redo, Settings } from "lucide-react";
import { FontControls, FontSettings } from "./FontControls";
import { useElectronAPI } from "@/hooks/useElectronAPI";

interface HeaderSectionProps {
  undoStack: any[];
  redoStack: any[];
  onUndo: () => void;
  onRedo: () => void;
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  undoStack,
  redoStack,
  onUndo,
  onRedo,
  fontSettings,
  onFontChange
}) => {
  const [showFontControls, setShowFontControls] = useState(false);
  const { isElectron } = useElectronAPI();

  const getFontClasses = () => {
    const weightClass = fontSettings.weight === 'normal' ? 'font-normal' : 
                       fontSettings.weight === 'medium' ? 'font-medium' :
                       fontSettings.weight === 'semibold' ? 'font-semibold' : 'font-bold';
    
    const colorClass = `text-${fontSettings.color}`;
    const italicClass = fontSettings.italic ? 'italic' : '';
    
    return `${weightClass} ${colorClass} ${italicClass}`;
  };

  return (
    <div className="mb-8 text-center space-y-4">
      <h1 
        className={`text-4xl bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent ${getFontClasses()}`}
        style={{ 
          fontSize: `${fontSettings.size * 2}px`,
          fontFamily: fontSettings.family 
        }}
      >
        💰 FinTech Debt Master Pro
      </h1>
      <p 
        className={`text-lg font-medium ${getFontClasses()}`}
        style={{ 
          fontSize: `${fontSettings.size}px`,
          fontFamily: fontSettings.family 
        }}
      >
        Intelligent Debt Management & Financial Freedom Platform
      </p>
      
      {/* Controls Row */}
      <div className="flex justify-center items-center gap-4 flex-wrap">
        {/* Undo/Redo buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={undoStack.length === 0}
            className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo {isElectron ? '(Ctrl+Z)' : ''}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={redoStack.length === 0}
            className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
          >
            <Redo className="h-4 w-4 mr-1" />
            Redo {isElectron ? '(Ctrl+Y)' : ''}
          </Button>
        </div>

        {/* Font Controls Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFontControls(!showFontControls)}
          className="bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:text-white"
        >
          <Settings className="h-4 w-4 mr-1" />
          Font Settings
        </Button>
      </div>

      {/* Font Controls Panel */}
      {showFontControls && (
        <div className="max-w-md mx-auto">
          <FontControls fontSettings={fontSettings} onFontChange={onFontChange} />
        </div>
      )}
    </div>
  );
};
