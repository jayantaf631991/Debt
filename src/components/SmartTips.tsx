
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, RefreshCw, Lightbulb, X, Brain, Heart, DollarSign, Target } from "lucide-react";
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
  category: 'psychological' | 'emotional' | 'financial' | 'behavioral';
  priority: 'high' | 'medium' | 'low';
  source: string;
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
        type: 'warning' as const,
        category: 'financial' as const,
        priority: 'high' as const,
        source: 'Dave Ramsey Method'
      });
    }

    // Debt avalanche strategy
    if (accounts.length > 1) {
      const sortedByInterest = [...accounts].sort((a, b) => b.interestRate - a.interestRate);
      newTips.push({
        id: 'debt-avalanche',
        title: '⚡ Debt Avalanche Strategy',
        content: `Pay minimums on all debts, then focus extra payments on "${sortedByInterest[0].name}" (${sortedByInterest[0].interestRate}% interest) to save the most money mathematically.`,
        type: 'strategy' as const,
        category: 'financial' as const,
        priority: 'high' as const,
        source: 'Financial Experts Consensus'
      });
    }

    // Psychological debt tips
    const psychologicalTips: Tip[] = [
      {
        id: 'debt-snowball-psychological',
        title: '🧠 The Debt Snowball Psychology',
        content: 'Consider paying smallest debts first for psychological wins. Each paid-off account releases dopamine and builds momentum, even if it costs slightly more in interest.',
        type: 'strategy' as const,
        category: 'psychological' as const,
        priority: 'medium' as const,
        source: 'Behavioral Economics Research'
      },
      {
        id: 'automation-bias',
        title: '🤖 Leverage Automation Bias',
        content: 'Set up automatic payments above minimums. Your brain treats automated payments as "already spent" money, reducing the psychological pain of debt payments.',
        type: 'general' as const,
        category: 'behavioral' as const,
        priority: 'medium' as const,
        source: 'Behavioral Finance Studies'
      },
      {
        id: 'mental-accounting',
        title: '💭 Mental Accounting Hack',
        content: 'Separate your debt payments into different mental "buckets." Visualize paying off debt as buying freedom rather than losing money.',
        type: 'general' as const,
        category: 'psychological' as const,
        priority: 'low' as const,
        source: 'Richard Thaler Research'
      }
    ];

    // Emotional financial tips
    const emotionalTips: Tip[] = [
      {
        id: 'stress-reduction',
        title: '😌 Stress Reduction Strategy',
        content: 'Financial stress increases cortisol, which impairs decision-making. Schedule 10 minutes daily to review finances calmly, reducing anxiety and improving choices.',
        type: 'general' as const,
        category: 'emotional' as const,
        priority: 'medium' as const,
        source: 'Financial Therapy Association'
      },
      {
        id: 'celebration-milestones',
        title: '🎉 Celebrate Small Wins',
        content: 'Reward yourself (inexpensively) for every ₹10,000 paid off. Positive reinforcement strengthens debt-paying behavior long-term.',
        type: 'general' as const,
        category: 'emotional' as const,
        priority: 'low' as const,
        source: 'Positive Psychology Research'
      },
      {
        id: 'identity-shift',
        title: '🏆 Identity-Based Change',
        content: 'Instead of "I want to pay off debt," say "I am someone who is debt-free." This identity shift makes debt-reduction behaviors feel natural.',
        type: 'general' as const,
        category: 'psychological' as const,
        priority: 'low' as const,
        source: 'James Clear - Atomic Habits'
      }
    ];

    // Advanced financial strategies
    const advancedStrategies: Tip[] = [
      {
        id: 'credit-utilization-optimization',
        title: '📊 Credit Score Optimization',
        content: 'Keep credit utilization below 10% (not 30%) for optimal credit scores. Pay before statement dates to show lower balances to credit bureaus.',
        type: 'strategy' as const,
        category: 'financial' as const,
        priority: 'medium' as const,
        source: 'FICO Scoring Models'
      },
      {
        id: 'balance-transfer-arbitrage',
        title: '🔄 Balance Transfer Strategy',
        content: 'If eligible, transfer high-interest debt to 0% APR cards. Use saved interest to aggressively pay principal, but avoid new spending.',
        type: 'strategy' as const,
        category: 'financial' as const,
        priority: 'high' as const,
        source: 'Credit Card Arbitrage Experts'
      },
      {
        id: 'opportunity-cost-thinking',
        title: '💰 Opportunity Cost Mindset',
        content: 'Every ₹100 in 20% interest debt costs ₹20/year. That same ₹100 could earn ₹12/year invested. Total opportunity cost: ₹32/year per ₹100.',
        type: 'general' as const,
        category: 'financial' as const,
        priority: 'medium' as const,
        source: 'Investment Theory'
      }
    ];

    // Behavioral nudges
    const behavioralNudges: Tip[] = [
      {
        id: 'envelope-method-digital',
        title: '📱 Digital Envelope Method',
        content: 'Use separate savings accounts for different goals. Visual progress bars and separate balances create stronger psychological commitment than one account.',
        type: 'strategy' as const,
        category: 'behavioral' as const,
        priority: 'medium' as const,
        source: 'Behavioral Design'
      },
      {
        id: 'loss-aversion-leverage',
        title: '⚡ Loss Aversion Leverage',
        content: 'Frame debt payments as "avoiding losing ₹X to interest" rather than "paying ₹X." Our brains hate losses 2x more than equivalent gains.',
        type: 'general' as const,
        category: 'psychological' as const,
        priority: 'low' as const,
        source: 'Kahneman & Tversky'
      },
      {
        id: 'implementation-intentions',
        title: '📝 Implementation Intentions',
        content: 'Create "if-then" plans: "If I receive unexpected money, then I immediately pay extra debt." Pre-decided actions bypass willpower limitations.',
        type: 'general' as const,
        category: 'behavioral' as const,
        priority: 'medium' as const,
        source: 'Peter Gollwitzer Research'
      }
    ];

    // Low balance warning
    if (bankBalance < 25000) {
      newTips.push({
        id: 'emergency-fund-priority',
        title: '🛡️ Emergency Fund Priority',
        content: 'Build ₹25,000 emergency fund before aggressive debt payments. Emergencies without savings create new debt, undoing your progress.',
        type: 'warning' as const,
        category: 'financial' as const,
        priority: 'high' as const,
        source: 'Financial Planning Standards'
      });
    }

    // Add random tips from each category
    const allTips = [...psychologicalTips, ...emotionalTips, ...advancedStrategies, ...behavioralNudges];
    const randomTips = allTips.sort(() => 0.5 - Math.random()).slice(0, 3);
    newTips.push(...randomTips);

    // Filter out dismissed tips
    const filteredTips = newTips.filter(tip => !dismissedTips.includes(tip.id));
    
    setTips(filteredTips.slice(0, 6)); // Show max 6 tips
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
    return <Badge className={`${colors[priority as keyof typeof colors]} text-white text-xs`}>{priority.toUpperCase()}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      psychological: <Brain className="h-4 w-4" />,
      emotional: <Heart className="h-4 w-4" />,
      financial: <DollarSign className="h-4 w-4" />,
      behavioral: <Target className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Lightbulb className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      psychological: 'bg-purple-500',
      emotional: 'bg-pink-500',
      financial: 'bg-green-500',
      behavioral: 'bg-blue-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="bg-cyan-800/30 border-cyan-600/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <Lightbulb className="h-6 w-6 text-cyan-300" />
            Advanced Financial Psychology Tips
          </CardTitle>
          <Button
            onClick={handleRefreshTips}
            variant="outline"
            size="sm"
            className="bg-cyan-800/50 border-cyan-600 text-cyan-200 hover:bg-cyan-700/50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Tips
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip) => (
          <Card key={tip.id} className={`${getTipColor(tip.type, tip.priority)} border backdrop-blur-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-white">{tip.title}</h3>
                    {getPriorityBadge(tip.priority)}
                    <Badge className={`${getCategoryColor(tip.category)} text-white text-xs flex items-center gap-1`}>
                      {getCategoryIcon(tip.category)}
                      {tip.category}
                    </Badge>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed mb-2">{tip.content}</p>
                  <p className="text-gray-400 text-xs">Source: {tip.source}</p>
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
            <p className="text-cyan-200 mb-2">All tips reviewed!</p>
            <p className="text-cyan-300 text-sm">Click refresh to get new psychological and financial insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
