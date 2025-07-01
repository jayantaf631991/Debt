
import React from 'react';
import { Button } from "@/components/ui/button";
import { NavLink } from 'react-router-dom';
import { Calculator, Calendar } from "lucide-react";

export const DashboardNavigation = () => {
  return (
    <div className="flex gap-4 mb-6">
      <NavLink to="/">
        {({ isActive }) => (
          <Button 
            variant={isActive ? "default" : "outline"}
            className={isActive ? "bg-purple-600" : ""}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Debt Tool
          </Button>
        )}
      </NavLink>
      
      <NavLink to="/attendify">
        {({ isActive }) => (
          <Button 
            variant={isActive ? "default" : "outline"}
            className={isActive ? "bg-blue-600" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Attendify
          </Button>
        )}
      </NavLink>
    </div>
  );
};
