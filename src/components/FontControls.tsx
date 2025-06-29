import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Bold, Italic, Type } from "lucide-react";

export interface FontSettings {
  size: number;
  family: string;
  weight: string;
  color: string;
  italic: boolean;
}

interface FontControlsProps {
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

export const FontControls: React.FC<FontControlsProps> = ({ fontSettings, onFontChange }) => {
  const fontFamilies = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
  ];

  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semi Bold' },
    { value: 'bold', label: 'Bold' },
  ];

  const fontColors = [
    { value: 'white', label: 'White', bg: 'bg-white' },
    { value: 'slate-100', label: 'Light Gray', bg: 'bg-slate-100' },
    { value: 'slate-200', label: 'Gray', bg: 'bg-slate-200' },
    { value: 'slate-800', label: 'Dark Gray', bg: 'bg-slate-800' },
    { value: 'black', label: 'Black', bg: 'bg-black' },
  ];

  const updateSetting = (key: keyof FontSettings, value: any) => {
    onFontChange({ ...fontSettings, [key]: value });
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Type className="h-5 w-5 text-blue-400" />
        <h3 className="text-white font-semibold">Font Controls</h3>
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center gap-2">
        <span className="text-slate-200 text-sm min-w-[60px]">Size:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSetting('size', Math.max(10, fontSettings.size - 2))}
          className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Badge variant="secondary" className="min-w-[50px] justify-center">
          {fontSettings.size}px
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSetting('size', Math.min(24, fontSettings.size + 2))}
          className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-2">
        <span className="text-slate-200 text-sm min-w-[60px]">Font:</span>
        <Select value={fontSettings.family} onValueChange={(value) => updateSetting('family', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} className="text-slate-200">
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight */}
      <div className="flex items-center gap-2">
        <span className="text-slate-200 text-sm min-w-[60px]">Weight:</span>
        <Select value={fontSettings.weight} onValueChange={(value) => updateSetting('weight', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {fontWeights.map((weight) => (
              <SelectItem key={weight.value} value={weight.value} className="text-slate-200">
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Color */}
      <div className="flex items-center gap-2">
        <span className="text-slate-200 text-sm min-w-[60px]">Color:</span>
        <Select value={fontSettings.color} onValueChange={(value) => updateSetting('color', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {fontColors.map((color) => (
              <SelectItem key={color.value} value={color.value} className="text-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color.bg}`}></div>
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Controls */}
      <div className="flex items-center gap-2">
        <span className="text-slate-200 text-sm min-w-[60px]">Style:</span>
        <Button
          variant={fontSettings.italic ? "default" : "outline"}
          size="sm"
          onClick={() => updateSetting('italic', !fontSettings.italic)}
          className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
