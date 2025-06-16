
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, RefreshCw, Lightbulb, X } from "lucide-react";
import { Account } from "@/pages/Index";

interface SmartTipsProps {
  accounts: Account[];
  bankBalance: number;
}

interface Tip {
  id: string;
  title: string;
  content: string;
  type: 'strategy' | 'savings' | 'warning' | 'general';
  priority: 'high' | 'medium' | 'low';
}

export const SmartTips: React.FC<SmartTipsProps> = ({ accounts, bankBalance }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  const generateTips = () => {
    const newTips: Tip[] = [];
    
    // High interest debt warning
    const highInterestAccounts = accounts.filter(acc => acc.interestRate > 20);
    if (highInterestAccounts.length > 0) {
      newTips.push({
        id: 'high-interest-warning',
        title: '🚨 High Interest Alert',
        content: `You have ${highInterestAccounts.length} account(s) with interest rates above 20%. Focus on paying these first to save maximum money.`,
        type: 'warning',
        priority: 'high'
      });
    }

    // Debt avalanche strategy
    if (accounts.length > 1) {
      const sortedByInterest = [...accounts].sort((a, b) => b.interestRate - a.interestRate);
      newTips.push({
        id: 'debt-avalanche',
        title: '⚡ Debt Avalanche Strategy',
        content: `Pay minimums on all debts, then focus extra payments on "${sortedByInterest[0].name}" (${sortedByInterest[0].interestRate}% interest) to save the most money.`,
        type: 'strategy',
        priority: 'high'
      });
    }

    // Low balance warning
    if (bankBalance < 10000) {
      newTips.push({
        id: 'low-balance-warning',
        title: '💰 Low Balance Alert',
        content: 'Your bank balance is running low. Consider building an emergency fund of at least ₹25,000 before aggressive debt payments.',
        type: 'warning',
        priority: 'high'
      });
    }

    // Debt-free timeline
    const totalDebt = accounts.reduce((sum, acc) => sum + acc.outstanding, 0);
    const totalMinPayments = accounts.reduce((sum, acc) => sum + acc.minPayment, 0);
    if (totalDebt > 0 && totalMinPayments > 0) {
      const monthsToFreedom = Math.ceil(totalDebt / totalMinPayments);
      newTips.push({
        id: 'debt-free-timeline',
        title: '🎯 Debt-Free Timeline',
        content: `At current minimum payments, you'll be debt-free in approximately ${monthsToFreedom} months. Increase payments by 20% to reduce this by ${Math.ceil(monthsToFreedom * 0.2)} months!`,
        type: 'general',
        priority: 'medium'
      });
    }

    // Credit utilization tips
    const creditCards = accounts.filter(acc => acc.type === 'credit-card');
    creditCards.forEach(card => {
      const utilization = (card.outstanding / (card.outstanding + 10000)) * 100; // Assuming credit limit
      if (utilization > 30) {
        newTips.push({
          id: `utilization-${card.id}`,
          title: '📊 Credit Utilization',
          content: `Your ${card.name} appears to have high utilization. Keep it below 30% to improve your credit score.`,
          type: 'general',
          priority: 'medium'
        });
      }
    });

    // Savings opportunity
    if (bankBalance > totalMinPayments * 2) {
      newTips.push({
        id: 'extra-payment-opportunity',
        title: '💡 Extra Payment Opportunity',
        content: 'You have enough balance to make extra payments! Even ₹1000 extra per month can save thousands in interest.',
        type: 'savings',
        priority: 'medium'
      });
    }

    // Financial wisdom tips
    const wisdomTips = [
      {
        id: 'compound-interest',
        title: '📈 Compound Interest Works Both Ways',
        content: 'Just as compound interest helps investments grow, it makes debt grow too. Every extra rupee paid today saves multiple rupees in future interest.',
        type: 'general',
        priority: 'low'
      },
      {
        id: 'emergency-fund',
        title: '🛡️ Emergency Fund Priority',
        content: 'Before aggressively paying debt, ensure you have at least 3-6 months of expenses saved. This prevents you from taking on more debt during emergencies.',
        type: 'general',
        priority: 'medium'
      },
      {
        id: 'autopay-benefits',
        title: '🤖 Automate Your Success',
        content: 'Set up automatic payments for at least the minimum due. Late fees and missed payments can cost more than the interest itself.',
        type: 'general',
        priority: 'medium'
      }
    ];

    // Add random wisdom tip
    const randomWisdom = wisdomTips[Math.floor(Math.random() * wisdomTips.length)];
    newTips.push(randomWisdom);

    // Filter out dismissed tips
    const filteredTips = newTips.filter(tip => !dismissedTips.includes(tip.id));
    
    setTips(filteredTips.slice(0, 5)); // Show max 5 tips
  };

  useEffect(() => {
    generateTips();
  }, [accounts, bankBalance, dismissedTips]);

  const handleDismissTip = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const handleRefreshTips = () => {
    setDismissedTips([]);
    generateTips();
  };

  const getTipColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-400/50 bg-red-500/10';
    if (type === 'savings') return 'border-green-400/50 bg-green-500/10';
    if (type === 'strategy') return 'border-blue-400/50 bg-blue-500/10';
    return 'border-purple-400/50 bg-purple-500/10';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
  };

  return (
    <Card className="bg-cyan-800/30 border-cyan-600/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <Lightbulb className="h-6 w-6 text-cyan-300" />
            Smart Financial Tips
          </CardTitle>
          <Button
            onClick={handleRefreshTips}
            variant="outline"
            size="sm"
            className="bg-cyan-800/50 border-cyan-600 text-cyan-200 hover:bg-cyan-700/50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip) => (
          <Card key={tip.id} className={`${getTipColor(tip.type, tip.priority)} border backdrop-blur-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{tip.title}</h3>
                    {getPriorityBadge(tip.priority)}
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{tip.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissTip(tip.id)}
                  className="text-gray-400 hover:text-gray-300 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tips.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-200 mb-2">All caught up!</p>
            <p className="text-cyan-300 text-sm">Click refresh to get new tips</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
