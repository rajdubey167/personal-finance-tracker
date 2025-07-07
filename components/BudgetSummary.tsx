"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { BudgetWithProgress } from '@/lib/types';

type ViewMode = 'all' | 'monthly' | 'category';

interface BudgetSummaryProps {
  budgets: BudgetWithProgress[];
  viewMode?: ViewMode;
}

export default function BudgetSummary({ budgets, viewMode = 'all' }: BudgetSummaryProps) {
  const summary = useMemo(() => {
    if (!budgets.length) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averagePercentage: 0,
        overBudgetCategories: 0,
        underBudgetCategories: 0,
        onTrackCategories: 0,
      };
    }

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const averagePercentage = budgets.reduce((sum, budget) => sum + budget.percentage, 0) / budgets.length;
    const overBudgetCategories = budgets.filter(budget => budget.status === 'over').length;
    const underBudgetCategories = budgets.filter(budget => budget.status === 'under').length;
    const onTrackCategories = budgets.filter(budget => budget.status === 'at').length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      averagePercentage,
      overBudgetCategories,
      underBudgetCategories,
      onTrackCategories,
    };
  }, [budgets]);

  const getSummaryTitle = () => {
    switch (viewMode) {
      case 'monthly':
        return 'Monthly Budget Summary';
      case 'category':
        return 'Category Budget Summary';
      default:
        return 'Budget Summary';
    }
  };

  const getBudgetTypeLabel = () => {
    switch (viewMode) {
      case 'monthly':
        return 'monthly budget';
      case 'category':
        return 'category budget';
      default:
        return 'budget';
    }
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getSummaryTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No {getBudgetTypeLabel()} data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getSummaryTitle()}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {budgets.length} {getBudgetTypeLabel()}{budgets.length !== 1 ? 's' : ''} for this period
          {viewMode === 'category' && budgets.length > 0 && (
            <span className="block mt-1">
              Categories: {budgets.map(b => b.category).filter(Boolean).join(', ')}
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Total Budget</p>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalBudget)}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Total Spent</p>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.averagePercentage.toFixed(1)}% of total budget
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Remaining</p>
            <div className={`text-2xl font-bold ${summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalRemaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <div className="text-2xl font-bold text-green-600">
              {summary.underBudgetCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overBudgetCategories > 0 && `${summary.overBudgetCategories} over`}
              {summary.onTrackCategories > 0 && `${summary.onTrackCategories} on track`}
              {summary.overBudgetCategories === 0 && summary.onTrackCategories === 0 && 'All under budget'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 