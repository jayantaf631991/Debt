
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

export const StoragePathDisplay: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPath, setCurrentPath] = useState('/local/dashboard-data');
  const [editPath, setEditPath] = useState(currentPath);

  const handleSavePath = () => {
    setCurrentPath(editPath);
    setIsEditing(false);
    toast.success("Storage path updated!");
  };

  const handleOpenPath = () => {
    toast.info("Opening storage location... (Feature requires desktop app)");
  };

  return (
    <Card className="bg-gradient-to-r from-purple-800/40 to-blue-800/40 border-purple-600/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-purple-300" />
            <span className="text-purple-200 text-sm">Storage Path:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editPath}
                  onChange={(e) => setEditPath(e.target.value)}
                  className="bg-purple-800 border-purple-600 text-purple-100 text-sm h-8"
                  placeholder="Enter storage path"
                />
                <Button size="sm" onClick={handleSavePath} className="h-8 w-8 p-0">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span 
                className="text-purple-100 font-mono text-sm cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleOpenPath}
              >
                {currentPath}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="border-purple-600 text-purple-300 hover:bg-purple-700/50 h-8"
              >
                <Edit className="h-3 w-3 mr-1" />
                Change
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={handleOpenPath}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 h-8"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-purple-300">
          Interest rates should be entered in <strong>monthly format</strong> (Annual rate ÷ 12)
        </div>
      </CardContent>
    </Card>
  );
};
