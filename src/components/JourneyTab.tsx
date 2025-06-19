
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Download, Calendar, DollarSign, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { Account, Expense } from "@/pages/Index";

interface JourneyTabProps {
  accounts: Account[];
  expenses: Expense[];
  bankBalance: number;
}

export const JourneyTab: React.FC<JourneyTabProps> = ({ accounts, expenses, bankBalance }) => {
  const [salary, setSalary] = useState(75000);
  const [targetMonths, setTargetMonths] = useState(24);
  const [story, setStory] = useState('');

  const generateStory = () => {
    const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
    const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const availableIncome = salary - totalExpenses - totalMinPayments;
    const monthsToDebtFree = totalDebt / (totalMinPayments + Math.max(0, availableIncome * 0.7));

    const storyText = `
📖 **The Journey to Financial Freedom**

Meet Rahul, a 28-year-old software engineer whose financial situation mirrors yours exactly. With a monthly salary of ₹${salary.toLocaleString()}, he found himself juggling multiple debts totaling ₹${totalDebt.toLocaleString()}.

**Day 1 - The Wake-Up Call**
Rahul realized he was paying ₹${totalMinPayments.toLocaleString()} just in minimum payments each month, with high-interest debts eating away at his future. His bank balance of ₹${bankBalance.toLocaleString()} felt insufficient against the mountain of debt ahead.

**Month 1-3 - Building the Foundation**
Rahul started tracking every expense meticulously. He identified ₹${(totalExpenses * 0.2).toFixed(0)} in unnecessary spending that he could cut. Instead of dining out 4 times a week, he cooked at home. He cancelled unused subscriptions and found cheaper alternatives for his needs.

**Month 4-8 - The Avalanche Strategy**
Following the debt avalanche method, Rahul focused on his highest interest rate debt first - his ${accounts.sort((a, b) => b.interestRate - a.interestRate)[0]?.name || 'credit card'} at ${accounts.sort((a, b) => b.interestRate - a.interestRate)[0]?.interestRate || 0}% interest. Every extra rupee went towards this debt while maintaining minimum payments on others.

**Month 9-15 - Momentum Builds**
As each debt was cleared, Rahul felt psychological wins that motivated him further. The money previously used for one debt's minimum payment was redirected to attack the next highest interest debt. This snowball effect accelerated his progress dramatically.

**Month 16-${Math.ceil(monthsToDebtFree)} - The Final Push**
With most high-interest debts cleared, Rahul could see the light at the end of the tunnel. His ${accounts.find(acc => acc.type === 'loan')?.name || 'home loan'} remained, but the psychological burden was lighter. He even started building an emergency fund alongside debt payments.

**The Victory Day - Month ${Math.ceil(monthsToDebtFree)}**
Rahul made his final payment! The ₹${totalMinPayments.toLocaleString()} that once went to minimum payments could now be redirected towards investments, savings, and enjoying life guilt-free.

**Key Strategies That Made the Difference:**
• Automated all payments to avoid missed dues
• Used windfalls (bonus, tax refunds) entirely for debt reduction
• Found a side hustle that added ₹15,000 monthly income
• Negotiated better interest rates with banks
• Stayed motivated by celebrating small milestones

**The Numbers:**
- Total debt cleared: ₹${totalDebt.toLocaleString()}
- Time taken: ${Math.ceil(monthsToDebtFree)} months
- Interest saved by aggressive payments: ₹${(totalDebt * 0.15).toFixed(0)}
- Monthly cash flow after debt freedom: ₹${(salary - totalExpenses).toLocaleString()}

**Life After Debt:**
Today, Rahul invests ₹40,000 monthly in SIPs, has a 6-month emergency fund, and sleeps peacefully knowing he owns his financial future. The discipline learned during his debt-free journey became the foundation for building lasting wealth.

*"The pain of discipline weighs ounces, but the pain of regret weighs tons. Every sacrifice I made was worth the freedom I have today."* - Rahul

**Your Journey Starts Today**
Like Rahul, you have everything you need to become debt-free. The tools are in your hands, the path is clear, and the destination - financial freedom - awaits!
    `;

    setStory(storyText);
  };

  const saveStory = () => {
    const storyWithMetadata = `
DEBT-FREE JOURNEY STORY
Generated on: ${new Date().toLocaleDateString()}
Target Months: ${targetMonths}
Monthly Salary: ₹${salary.toLocaleString()}
Total Debt: ₹${accounts.reduce((sum, acc) => sum + acc.outstanding, 0).toLocaleString()}

${story}
    `;

    const blob = new Blob([storyWithMetadata], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debt-free-journey-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Story saved successfully!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-100">
            <BookOpen className="h-6 w-6 text-emerald-300" />
            Your Debt-Free Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-emerald-200">Monthly Salary (₹)</Label>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="bg-emerald-800/50 border-emerald-600 text-emerald-100"
              />
            </div>
            <div>
              <Label className="text-emerald-200">Target Timeline (months)</Label>
              <Select value={targetMonths.toString()} onValueChange={(value) => setTargetMonths(Number(value))}>
                <SelectTrigger className="bg-emerald-800/50 border-emerald-600 text-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-emerald-800 border-emerald-600">
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                  <SelectItem value="48">48 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateStory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Story
              </Button>
            </div>
          </div>

          {story && (
            <Card className="bg-emerald-900/30 border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-emerald-100">Your Personalized Journey</h3>
                  <Button 
                    onClick={saveStory}
                    variant="outline"
                    className="bg-emerald-800/50 border-emerald-600 text-emerald-200 hover:bg-emerald-700/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Save Story
                  </Button>
                </div>
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="min-h-[500px] bg-emerald-800/30 border-emerald-600 text-emerald-100 text-sm leading-relaxed"
                  placeholder="Your personalized debt-free journey will appear here..."
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-700/30 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-emerald-200 text-sm">Total Debt</p>
                <p className="text-lg font-bold text-emerald-100">
                  ₹{accounts.reduce((sum, acc) => sum + acc.outstanding, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-700/30 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-emerald-200 text-sm">Estimated Timeline</p>
                <p className="text-lg font-bold text-emerald-100">
                  {Math.ceil(accounts.reduce((sum, acc) => sum + acc.outstanding, 0) / (salary * 0.3))} months
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-700/30 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-emerald-200 text-sm">Freedom Date</p>
                <p className="text-lg font-bold text-emerald-100">
                  {new Date(Date.now() + (Math.ceil(accounts.reduce((sum, acc) => sum + acc.outstanding, 0) / (salary * 0.3)) * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
