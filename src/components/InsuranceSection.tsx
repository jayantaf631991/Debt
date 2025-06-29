
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield, Heart, TrendingUp } from "lucide-react";

export interface InsurancePolicy {
  id: string;
  name: string;
  type: 'health' | 'life' | 'wealth';
  provider: string;
  premium: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
}

interface InsuranceSectionProps {
  policies: InsurancePolicy[];
  onPoliciesChange: (policies: InsurancePolicy[]) => void;
}

export const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  policies,
  onPoliciesChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
    name: '',
    type: 'health',
    provider: '',
    premium: 0,
    coverageAmount: 0,
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const handleAddPolicy = () => {
    if (newPolicy.name && newPolicy.provider) {
      const policy: InsurancePolicy = {
        id: Date.now().toString(),
        name: newPolicy.name,
        type: newPolicy.type as 'health' | 'life' | 'wealth',
        provider: newPolicy.provider,
        premium: newPolicy.premium || 0,
        coverageAmount: newPolicy.coverageAmount || 0,
        startDate: newPolicy.startDate || '',
        endDate: newPolicy.endDate || '',
        status: newPolicy.status as 'active' | 'expired' | 'pending'
      };
      
      onPoliciesChange([...policies, policy]);
      setNewPolicy({
        name: '',
        type: 'health',
        provider: '',
        premium: 0,
        coverageAmount: 0,
        startDate: '',
        endDate: '',
        status: 'active'
      });
      setShowAddForm(false);
    }
  };

  const handleDeletePolicy = (id: string) => {
    onPoliciesChange(policies.filter(policy => policy.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="h-5 w-5 text-red-500" />;
      case 'life': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'wealth': return <TrendingUp className="h-5 w-5 text-green-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPremium = policies.reduce((sum, policy) => sum + policy.premium, 0);
  const totalCoverage = policies.reduce((sum, policy) => sum + policy.coverageAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-800/30 border-blue-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Policies</p>
                <p className="text-2xl font-bold text-blue-100">{policies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-800/30 border-orange-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Total Premium</p>
                <p className="text-2xl font-bold text-orange-100">₹{totalPremium.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-800/30 border-green-600/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Coverage</p>
                <p className="text-2xl font-bold text-green-100">₹{totalCoverage.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Policy Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Insurance Policies</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Add Policy Form */}
      {showAddForm && (
        <Card className="bg-purple-800/30 border-purple-600/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Add New Insurance Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-200">Policy Name</Label>
                <Input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                  placeholder="Enter policy name"
                />
              </div>
              <div>
                <Label className="text-purple-200">Provider</Label>
                <Input
                  value={newPolicy.provider}
                  onChange={(e) => setNewPolicy({ ...newPolicy, provider: e.target.value })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                  placeholder="Insurance company"
                />
              </div>
              <div>
                <Label className="text-purple-200">Type</Label>
                <Select value={newPolicy.type} onValueChange={(value) => setNewPolicy({ ...newPolicy, type: value as any })}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health Insurance</SelectItem>
                    <SelectItem value="life">Life Insurance</SelectItem>
                    <SelectItem value="wealth">Wealth Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-purple-200">Premium (₹)</Label>
                <Input
                  type="number"
                  value={newPolicy.premium}
                  onChange={(e) => setNewPolicy({ ...newPolicy, premium: Number(e.target.value) })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                />
              </div>
              <div>
                <Label className="text-purple-200">Coverage Amount (₹)</Label>
                <Input
                  type="number"
                  value={newPolicy.coverageAmount}
                  onChange={(e) => setNewPolicy({ ...newPolicy, coverageAmount: Number(e.target.value) })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                />
              </div>
              <div>
                <Label className="text-purple-200">Start Date</Label>
                <Input
                  type="date"
                  value={newPolicy.startDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, startDate: e.target.value })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                />
              </div>
              <div>
                <Label className="text-purple-200">End Date</Label>
                <Input
                  type="date"
                  value={newPolicy.endDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, endDate: e.target.value })}
                  className="bg-purple-800/50 border-purple-600 text-purple-100"
                />
              </div>
              <div>
                <Label className="text-purple-200">Status</Label>
                <Select value={newPolicy.status} onValueChange={(value) => setNewPolicy({ ...newPolicy, status: value as any })}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPolicy}>Add Policy</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => (
          <Card key={policy.id} className="bg-slate-800/30 border-slate-600/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(policy.type)}
                  <h3 className="font-semibold text-white">{policy.name}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePolicy(policy.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Provider:</span>
                  <span className="text-white">{policy.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Premium:</span>
                  <span className="text-white">₹{policy.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Coverage:</span>
                  <span className="text-white">₹{policy.coverageAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Validity:</span>
                  <span className="text-white">{policy.startDate} to {policy.endDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {policies.length === 0 && !showAddForm && (
        <Card className="bg-slate-800/30 border-slate-600/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No insurance policies added yet</p>
            <p className="text-gray-500 mb-4">Start by adding your first insurance policy</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
