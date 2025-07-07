"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';

interface SpendingInsightsProps {
  insights: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    averageMonthlyIncome: number;
    averageMonthlyExpenses: number;
    topCategory: string | null;
    topCategoryAmount: number;
    expenseCount: number;
    incomeCount: number;
  };
  transactions: Transaction[];
}

export default function SpendingInsights({ insights, transactions }: SpendingInsightsProps) {
  const analysis = useMemo(() => {
    if (!transactions.length) return [];

    const analysisItems = [];

    if (insights.netSavings > 0) {
      analysisItems.push({
        type: 'positive',
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        title: 'Positive Cash Flow',
        description: `You're saving ${formatCurrency(insights.netSavings)} more than you're spending. Great job!`,
        recommendation: 'Consider investing your surplus or building an emergency fund.'
      });
         } else if (insights.netSavings < 0) {
       analysisItems.push({
         type: 'warning',
         icon: <TrendingDown className="h-4 w-4 text-red-600" />,
         title: 'Negative Cash Flow',
         description: `You're spending ${formatCurrency(Math.abs(insights.netSavings))} more than your income.`,
         recommendation: 'Review your expenses and look for areas to reduce spending.'
       });
     } else {
       analysisItems.push({
         type: 'positive',
         icon: <CheckCircle className="h-4 w-4 text-green-600" />,
         title: 'Balanced Cash Flow',
         description: 'Your income and expenses are balanced.',
         recommendation: 'Great job maintaining a balanced budget!'
       });
     }

    if (insights.topCategory && insights.topCategoryAmount > 0) {
      const percentage = (insights.topCategoryAmount / insights.totalExpenses) * 100;
      
      if (percentage > 30) {
        analysisItems.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
          title: 'High Category Concentration',
          description: `${insights.topCategory} represents ${percentage.toFixed(1)}% of your total expenses.`,
          recommendation: 'Consider diversifying your spending or setting a budget for this category.'
        });
      } else {
        analysisItems.push({
          type: 'positive',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          title: 'Well-Distributed Spending',
          description: `Your top category (${insights.topCategory}) represents ${percentage.toFixed(1)}% of expenses.`,
          recommendation: 'Your spending is well-balanced across categories.'
        });
      }
    }

    if (insights.averageMonthlyExpenses > 0) {
      const savingsRate = ((insights.averageMonthlyIncome - insights.averageMonthlyExpenses) / insights.averageMonthlyIncome) * 100;
      
      if (savingsRate > 20) {
        analysisItems.push({
          type: 'positive',
          icon: <DollarSign className="h-4 w-4 text-green-600" />,
          title: 'Excellent Savings Rate',
          description: `You're saving ${savingsRate.toFixed(1)}% of your monthly income on average.`,
          recommendation: 'Consider increasing your investments or emergency fund contributions.'
        });
      } else if (savingsRate < 10) {
        analysisItems.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
          title: 'Low Savings Rate',
          description: `You're saving only ${savingsRate.toFixed(1)}% of your monthly income.`,
          recommendation: 'Aim to save at least 20% of your income for financial security.'
        });
      }
    }

    const avgTransactionsPerMonth = (insights.expenseCount + insights.incomeCount) / (transactions.length > 0 ? Math.ceil(transactions.length / 10) : 1);
    
    if (avgTransactionsPerMonth > 50) {
      analysisItems.push({
        type: 'info',
        icon: <Calendar className="h-4 w-4 text-blue-600" />,
        title: 'High Transaction Frequency',
        description: `You have ${avgTransactionsPerMonth.toFixed(0)} transactions per month on average.`,
        recommendation: 'Consider consolidating small purchases to reduce transaction fees and simplify tracking.'
      });
    }

    return analysisItems;
  }, [insights, transactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No transaction data available for analysis.</p>
            <p className="text-sm">Add some transactions to get personalized insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Insights & Recommendations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized analysis based on your spending patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysis.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>Add more transactions to get personalized insights.</p>
            </div>
          ) : (
            analysis.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border">
                <div className="mt-1">
                  {item.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge 
                      variant={item.type === 'positive' ? 'default' : item.type === 'warning' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.type === 'positive' ? 'Good' : item.type === 'warning' ? 'Attention' : 'Info'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-medium text-blue-600">
                    💡 {item.recommendation}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 