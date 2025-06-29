
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Mail, CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const IntegrationSettings: React.FC = () => {
  const [phoneIntegration, setPhoneIntegration] = useState(false);
  const [emailIntegration, setEmailIntegration] = useState(false);
  const [credIntegration, setCredIntegration] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const handlePhoneToggle = () => {
    setPhoneIntegration(!phoneIntegration);
    if (!phoneIntegration) {
      toast.info("Phone integration requires SMS permissions and backend setup");
    } else {
      toast.success("Phone integration disabled");
    }
  };

  const handleEmailToggle = () => {
    setEmailIntegration(!emailIntegration);
    if (!emailIntegration) {
      toast.info("Email integration requires email server configuration");
    } else {
      toast.success("Email integration disabled");
    }
  };

  const handleCredToggle = () => {
    setCredIntegration(!credIntegration);
    if (!credIntegration) {
      toast.info("CRED integration requires API keys and backend setup");
    } else {
      toast.success("CRED integration disabled");
    }
  };

  return (
    <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-100">
          <Smartphone className="h-6 w-6 text-green-400" />
          External Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-600/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-100 mb-2">Integration Setup Required</h4>
              <p className="text-orange-200 text-sm">
                These integrations require backend services and API configurations. 
                In a production environment, these would connect to secure backend services.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-purple-700/30 border-purple-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-purple-100">SMS Integration</h3>
                    <p className="text-sm text-purple-300">Receive expense alerts and balance updates via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={phoneIntegration}
                  onCheckedChange={handlePhoneToggle}
                />
              </div>
              {phoneIntegration && (
                <div className="space-y-2">
                  <Label className="text-purple-200">Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-purple-800 border-purple-600 text-purple-100"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-700/30 border-purple-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-purple-100">Email Integration</h3>
                    <p className="text-sm text-purple-300">Get monthly reports and due date reminders</p>
                  </div>
                </div>
                <Switch
                  checked={emailIntegration}
                  onCheckedChange={handleEmailToggle}
                />
              </div>
              {emailIntegration && (
                <div className="space-y-2">
                  <Label className="text-purple-200">Email Address</Label>
                  <Input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-purple-800 border-purple-600 text-purple-100"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-700/30 border-purple-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-purple-100">CRED Integration</h3>
                    <p className="text-sm text-purple-300">Auto-sync credit card dues and payment history</p>
                  </div>
                </div>
                <Switch
                  checked={credIntegration}
                  onCheckedChange={handleCredToggle}
                />
              </div>
              {credIntegration && (
                <div className="space-y-4">
                  <p className="text-sm text-purple-300">
                    This would automatically categorize transactions by:
                  </p>
                  <ul className="text-sm text-purple-200 space-y-1 ml-4">
                    <li>• Bank (HDFC, ICICI, SBI, etc.)</li>
                    <li>• Type (Credit Card, Loan, UPI, etc.)</li>
                    <li>• Category (Food, Transport, Bills, etc.)</li>
                    <li>• Amount and transaction dates</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-purple-900/50 p-4 rounded-lg border border-purple-600/50">
          <h4 className="font-semibold text-purple-100 mb-2">What These Integrations Would Provide:</h4>
          <ul className="text-purple-200 text-sm space-y-2">
            <li>• <strong>Real-time balance tracking</strong> from bank APIs</li>
            <li>• <strong>Automatic expense categorization</strong> from transaction data</li>
            <li>• <strong>Due date notifications</strong> via SMS and email</li>
            <li>• <strong>Smart payment suggestions</strong> based on spending patterns</li>
            <li>• <strong>Credit score monitoring</strong> and improvement tips</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
