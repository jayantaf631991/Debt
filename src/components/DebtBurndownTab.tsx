
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, TrendingDown, Clock, DollarSign, Lightbulb, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/pages/Index";

interface DebtBurndownProps {
  accounts: Account[];
}

interface DebtScenario {
  id: string;
  name: string;
  outstanding: number;
  minPayment: number;
  interestRate: number;
  type: 'credit-card' | 'loan';
  paidAmount: number;
  include: boolean;
}

type PayoffStrategy = 'avalanche' | 'snowball' | 'minimum' | 'equal';

export const DebtBurndownTab: React.FC<DebtBurndownProps> = ({ accounts }) => {
  const [debtScenarios, setDebtScenarios] = useState<DebtScenario[]>([]);
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [targetMonths, setTargetMonths] = useState(24);
  const [includeCreditCards, setIncludeCreditCards] = useState(true);
  const [includeLoans, setIncludeLoans] = useState(true);
  const [projectionResults, setProjectionResults] = useState<any>(null);

  // Initialize debt scenarios from accounts
  useEffect(() => {
    const scenarios = accounts.map(account => ({
      id: account.id,
      name: account.name,
      outstanding: account.outstanding,
      minPayment: account.minPayment,
      interestRate: account.interestRate,
      type: account.type,
      paidAmount: account.minPayment,
      include: true
    }));
    setDebtScenarios(scenarios);
  }, [accounts]);

  // Filter scenarios based on checkboxes
  const filteredScenarios = debtScenarios.filter(scenario => 
    (scenario.type === 'credit-card' && includeCreditCards) || 
    (scenario.type === 'loan' && includeLoans)
  );

  // Calculate totals
  const totalOutstanding = filteredScenarios.reduce((sum, scenario) => 
    scenario.include ? sum + scenario.outstanding : sum, 0);
  const totalMinPayment = filteredScenarios.reduce((sum, scenario) => 
    scenario.include ? sum + scenario.minPayment : sum, 0);
  const currentTotalPaid = filteredScenarios.reduce((sum, scenario) => 
    scenario.include ? sum + scenario.paidAmount : sum, 0);

  const handleScenarioChange = (id: string, field: keyof DebtScenario, value: any) => {
    setDebtScenarios(prev => prev.map(scenario => 
      scenario.id === id ? { ...scenario, [field]: value } : scenario
    ));
  };

  const distributePaidAmount = () => {
    if (totalPaidAmount <= 0) {
      toast.error("Please enter a valid total paid amount");
      return;
    }

    const includedScenarios = filteredScenarios.filter(s => s.include);
    if (includedScenarios.length === 0) {
      toast.error("Please include at least one debt account");
      return;
    }

    // Calculate minimum required payments
    const totalMinRequired = includedScenarios.reduce((sum, s) => sum + s.minPayment, 0);
    
    if (totalPaidAmount < totalMinRequired) {
      toast.error(`Total payment must be at least ₹${totalMinRequired.toLocaleString()} to cover minimum payments`);
      return;
    }

    // Reset all paid amounts to minimum first
    const updatedScenarios = [...debtScenarios];
    updatedScenarios.forEach(scenario => {
      if (filteredScenarios.some(f => f.id === scenario.id && f.include)) {
        scenario.paidAmount = scenario.minPayment;
      }
    });

    // Distribute extra amount based on strategy
    const extraAmount = totalPaidAmount - totalMinRequired;
    let remainingExtra = extraAmount;

    // Sort by strategy
    const sortedIncluded = [...includedScenarios].sort((a, b) => {
      switch (strategy) {
        case 'avalanche':
          return b.interestRate - a.interestRate; // Highest interest first
        case 'snowball':
          return a.outstanding - b.outstanding; // Lowest balance first
        case 'equal':
          return 0; // No sorting needed
        default:
          return 0; // Minimum only
      }
    });

    if (strategy === 'equal') {
      // Distribute equally among all included debts
      const extraPerDebt = extraAmount / sortedIncluded.length;
      sortedIncluded.forEach(scenario => {
        const scenarioIndex = updatedScenarios.findIndex(s => s.id === scenario.id);
        if (scenarioIndex !== -1) {
          updatedScenarios[scenarioIndex].paidAmount += extraPerDebt;
        }
      });
    } else if (strategy !== 'minimum') {
      // Avalanche or Snowball: Focus extra on highest priority debt
      for (const scenario of sortedIncluded) {
        if (remainingExtra <= 0) break;
        
        const scenarioIndex = updatedScenarios.findIndex(s => s.id === scenario.id);
        if (scenarioIndex !== -1) {
          const maxPossible = Math.min(remainingExtra, scenario.outstanding - scenario.minPayment);
          updatedScenarios[scenarioIndex].paidAmount += maxPossible;
          remainingExtra -= maxPossible;
        }
      }
    }

    setDebtScenarios(updatedScenarios);
    toast.success(`Distributed ₹${totalPaidAmount.toLocaleString()} using ${strategy} strategy`);
  };

  const calculateProjection = () => {
    const includedScenarios = filteredScenarios.filter(s => s.include);
    if (includedScenarios.length === 0) {
      toast.error("Please include at least one debt account");
      return;
    }

    // Simple projection calculation
    let totalInterestSaved = 0;
    let payoffTime = 0;
    const monthlyPayment = includedScenarios.reduce((sum, s) => sum + s.paidAmount, 0);

    // Calculate rough payoff time based on strategy
    const totalDebt = includedScenarios.reduce((sum, s) => sum + s.outstanding, 0);
    const avgInterestRate = includedScenarios.reduce((sum, s) => sum + (s.interestRate * s.outstanding), 0) / totalDebt;
    
    // Simplified calculation - actual calculation would be more complex
    const monthlyInterest = (avgInterestRate / 100 / 12);
    const principal = monthlyPayment - (totalDebt * monthlyInterest);
    
    if (principal > 0) {
      payoffTime = Math.ceil(totalDebt / principal);
      const minPayoffTime = Math.ceil(totalDebt / totalMinPayment);
      totalInterestSaved = (minPayoffTime - payoffTime) * totalDebt * monthlyInterest;
    }

    setProjectionResults({
      payoffTime,
      totalInterestSaved: Math.max(0, totalInterestSaved),
      monthlyPayment,
      debtFreeDate: new Date(Date.now() + payoffTime * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });

    toast.success("Projection calculated successfully!");
  };

  const getConsolidationSuggestion = () => {
    const creditCards = filteredScenarios.filter(s => s.type === 'credit-card' && s.include);
    const avgCCRate = creditCards.reduce((sum, cc) => sum + cc.interestRate, 0) / creditCards.length;
    const totalCCDebt = creditCards.reduce((sum, cc) => sum + cc.outstanding, 0);
    
    if (creditCards.length > 1 && avgCCRate > 15) {
      return {
        suggested: true,
        message: `Consider consolidating ${creditCards.length} credit cards (₹${totalCCDebt.toLocaleString()}) with a personal loan at ~12-15% to save on interest.`,
        potentialSavings: (avgCCRate - 13) * totalCCDebt / 100
      };
    }
    return { suggested: false };
  };

  const consolidationSuggestion = getConsolidationSuggestion();

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen p-6">
      <Card className="bg-purple-800/30 border-purple-600/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Debt Burndown Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Strategy and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Payment Strategy</label>
              <Select value={strategy} onValueChange={(value: PayoffStrategy) => setStrategy(value)}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="avalanche">Avalanche (High Interest First)</SelectItem>
                  <SelectItem value="snowball">Snowball (Low Balance First)</SelectItem>
                  <SelectItem value="equal">Equal Distribution</SelectItem>
                  <SelectItem value="minimum">Minimum Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm mb-2">Target Months</label>
              <Input
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="bg-purple-800 border-purple-600 text-purple-100"
              />
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="cc" 
                  checked={includeCreditCards}
                  onCheckedChange={setIncludeCreditCards}
                />
                <label htmlFor="cc" className="text-purple-200 text-sm">Credit Cards</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="loans" 
                  checked={includeLoans}
                  onCheckedChange={setIncludeLoans}
                />
                <label htmlFor="loans" className="text-purple-200 text-sm">Loans</label>
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-2">Total Payment</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={totalPaidAmount}
                  onChange={(e) => setTotalPaidAmount(Number(e.target.value))}
                  className="bg-purple-800 border-purple-600 text-purple-100"
                  placeholder="Enter total amount"
                />
                <Button onClick={distributePaidAmount} size="sm">
                  Distribute
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4 text-center">
                <h3 className="text-purple-200 text-sm">Total Outstanding</h3>
                <p className="text-xl font-bold text-red-400">₹{totalOutstanding.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4 text-center">
                <h3 className="text-purple-200 text-sm">Min Payments</h3>
                <p className="text-xl font-bold text-orange-400">₹{totalMinPayment.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-700/30 border-purple-500/50">
              <CardContent className="p-4 text-center">
                <h3 className="text-purple-200 text-sm">Current Total Paid</h3>
                <p className="text-xl font-bold text-green-400">₹{currentTotalPaid.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Debt Table */}
          <div className="rounded-lg border border-purple-600/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-700/50">
                  <TableHead className="text-purple-100">Include</TableHead>
                  <TableHead className="text-purple-100">Account</TableHead>
                  <TableHead className="text-purple-100">Outstanding</TableHead>
                  <TableHead className="text-purple-100">Min Payment</TableHead>
                  <TableHead className="text-purple-100">Interest Rate</TableHead>
                  <TableHead className="text-purple-100">Paid Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScenarios.map((scenario) => (
                  <TableRow key={scenario.id} className="border-purple-600/50">
                    <TableCell>
                      <Checkbox
                        checked={scenario.include}
                        onCheckedChange={(checked) => 
                          handleScenarioChange(scenario.id, 'include', checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-purple-100">{scenario.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={scenario.outstanding}
                        onChange={(e) => 
                          handleScenarioChange(scenario.id, 'outstanding', Number(e.target.value))
                        }
                        className="w-32 bg-purple-800 border-purple-600 text-purple-100"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={scenario.minPayment}
                        onChange={(e) => 
                          handleScenarioChange(scenario.id, 'minPayment', Number(e.target.value))
                        }
                        className="w-24 bg-purple-800 border-purple-600 text-purple-100"
                      />
                    </TableCell>
                    <TableCell className="text-purple-200">{scenario.interestRate}%</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={scenario.paidAmount}
                        onChange={(e) => 
                          handleScenarioChange(scenario.id, 'paidAmount', Number(e.target.value))
                        }
                        className="w-24 bg-purple-800 border-purple-600 text-purple-100"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Consolidation Suggestion */}
          {consolidationSuggestion.suggested && (
            <Card className="bg-blue-800/30 border-blue-600/50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-300 mt-1" />
                  <div>
                    <h4 className="text-blue-200 font-medium mb-1">Consolidation Suggestion</h4>
                    <p className="text-blue-100 text-sm">{consolidationSuggestion.message}</p>
                    <p className="text-green-400 text-sm mt-1">
                      Potential annual savings: ₹{consolidationSuggestion.potentialSavings?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculate Button */}
          <div className="mt-6 text-center">
            <Button onClick={calculateProjection} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <TrendingDown className="h-4 w-4 mr-2" />
              Calculate Projection
            </Button>
          </div>

          {/* Results */}
          {projectionResults && (
            <Card className="bg-green-800/30 border-green-600/50 mt-6">
              <CardHeader>
                <CardTitle className="text-green-100">Projection Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-green-300 mx-auto mb-2" />
                    <h4 className="text-green-200 text-sm">Payoff Time</h4>
                    <p className="text-xl font-bold text-green-100">
                      {projectionResults.payoffTime} months
                    </p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-green-300 mx-auto mb-2" />
                    <h4 className="text-green-200 text-sm">Interest Saved</h4>
                    <p className="text-xl font-bold text-green-100">
                      ₹{projectionResults.totalInterestSaved.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingDown className="h-8 w-8 text-green-300 mx-auto mb-2" />
                    <h4 className="text-green-200 text-sm">Monthly Payment</h4>
                    <p className="text-xl font-bold text-green-100">
                      ₹{projectionResults.monthlyPayment.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-green-300 mx-auto mb-2" />
                    <h4 className="text-green-200 text-sm">Debt Free Date</h4>
                    <p className="text-xl font-bold text-green-100">
                      {projectionResults.debtFreeDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
