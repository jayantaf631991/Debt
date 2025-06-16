
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Banknote, Edit, Check, X } from "lucide-react";
import { FontSettings } from "./FontControls";

interface BankBalanceCardProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  fontSettings: FontSettings;
}

export const BankBalanceCard: React.FC<BankBalanceCardProps> = ({ 
  balance, 
  onBalanceChange, 
  fontSettings 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBalance, setTempBalance] = useState(balance.toString());

  const handleSave = () => {
    const newBalance = parseFloat(tempBalance);
    if (!isNaN(newBalance) && newBalance >= 0) {
      onBalanceChange(newBalance);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempBalance(balance.toString());
    setIsEditing(false);
  };

  const getFontClasses = () => {
    const weightClass = fontSettings.weight === 'normal' ? 'font-normal' : 
                       fontSettings.weight === 'medium' ? 'font-medium' :
                       fontSettings.weight === 'semibold' ? 'font-semibold' : 'font-bold';
    
    const italicClass = fontSettings.italic ? 'italic' : '';
    
    return `${weightClass} ${italicClass}`;
  };

  const cardStyle = {
    fontSize: `${fontSettings.size}px`,
    fontFamily: fontSettings.family
  };

  return (
    <Card className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-gray-900">
          <div className="flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-800" />
            <span 
              className={`${getFontClasses()}`}
              style={cardStyle}
            >
              Current Bank Balance
            </span>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-500/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                className="bg-emerald-100 border-emerald-600 text-gray-900 text-2xl font-bold"
                placeholder="Enter amount"
                autoFocus
                style={{ ...cardStyle, fontSize: `${fontSettings.size * 1.5}px` }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-500/20"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-red-700 hover:text-red-800 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className={`text-4xl font-bold text-gray-900 ${getFontClasses()}`}
            style={{ ...cardStyle, fontSize: `${fontSettings.size * 2}px` }}
          >
            ₹{balance.toLocaleString()}
          </div>
        )}
        <p 
          className={`text-gray-700 text-sm mt-1 ${getFontClasses()}`}
          style={cardStyle}
        >
          Available for payments and expenses
        </p>
      </CardContent>
    </Card>
  );
};
