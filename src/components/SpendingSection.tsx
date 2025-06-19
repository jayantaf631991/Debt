
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SpendingSectionProps {
  spendingCategories: { [key: string]: number };
  onSpendingChange: (category: string, amount: number) => void;
}

export const SpendingSection: React.FC<SpendingSectionProps> = ({ 
  spendingCategories, 
  onSpendingChange 
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategory && newAmount) {
      onSpendingChange(newCategory, parseFloat(newAmount));
      setNewCategory('');
      setNewAmount('');
      toast.success(`Category "${newCategory}" added`);
    }
  };

  const handleUpdateCategory = (category: string, amount: number) => {
    onSpendingChange(category, amount);
    setEditingCategory(null);
    toast.success(`Category "${category}" updated`);
  };

  const totalSpending = Object.values(spendingCategories).reduce((sum, amount) => sum + amount, 0);

  return (
    <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-100">
          <BarChart3 className="h-6 w-6 text-orange-300" />
          Spending Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-100">₹{totalSpending.toLocaleString()}</p>
          <p className="text-orange-200">Total Monthly Spending</p>
        </div>

        <div className="space-y-3">
          {Object.entries(spendingCategories).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between bg-orange-700/30 p-3 rounded-lg">
              <div>
                <h3 className="font-medium text-orange-100">{category}</h3>
                <p className="text-orange-200">₹{amount.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {((amount / totalSpending) * 100).toFixed(1)}%
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  className="text-orange-300 hover:text-orange-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-orange-800/50 border-orange-600 text-orange-100"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="bg-orange-800/50 border-orange-600 text-orange-100"
          />
          <Button 
            onClick={handleAddCategory}
            className="bg-orange-600 hover:bg-orange-500 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
