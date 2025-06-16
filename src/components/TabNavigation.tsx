
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  PieChart, 
  History, 
  FileText, 
  Settings, 
  Target 
} from "lucide-react";

export const TabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-6 bg-slate-800/60 backdrop-blur-sm border-slate-600/30">
      <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <TrendingUp className="h-4 w-4 mr-2" />
        Dashboard
      </TabsTrigger>
      <TabsTrigger value="charts" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <PieChart className="h-4 w-4 mr-2" />
        Analytics
      </TabsTrigger>
      <TabsTrigger value="categories" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <FileText className="h-4 w-4 mr-2" />
        Categories
      </TabsTrigger>
      <TabsTrigger value="history" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <History className="h-4 w-4 mr-2" />
        History
      </TabsTrigger>
      <TabsTrigger value="emergency" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <Target className="h-4 w-4 mr-2" />
        Emergency
      </TabsTrigger>
      <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </TabsTrigger>
    </TabsList>
  );
};
