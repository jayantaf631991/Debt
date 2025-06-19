
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  History, 
  Settings, 
  Shield, 
  Tag, 
  Home,
  BookOpen,
  Database
} from "lucide-react";

export const TabNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/10 backdrop-blur-sm border border-white/20">
      <TabsTrigger 
        value="dashboard" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <Home className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Dashboard</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="charts" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Charts</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="categories" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <Tag className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Categories</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="history" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <History className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">History</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="journey" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Journey</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="emergency" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <Shield className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Emergency</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="data" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <Database className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Data</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="settings" 
        className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white/90"
      >
        <Settings className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Settings</span>
      </TabsTrigger>
    </TabsList>
  );
};
