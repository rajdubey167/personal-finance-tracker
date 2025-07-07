"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';

interface TopSpendingCategoriesProps {
  transactions: Transaction[];
}

export default function TopSpendingCategories({ transactions }: TopSpendingCategoriesProps) {
  const categoryData = useMemo(() => {
    if (!transactions.length) return [];

    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (!expenses.length) return [];

    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        transactionCount: expenses.filter(t => t.category === category).length,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense transactions found for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Rankings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalExpenses)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {categoryData.map((item, index) => (
            <div key={item.category} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                    #{index + 1}
                  </Badge>
                  <span className="font-semibold text-base">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.percentage.toFixed(1)}% of total</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                <Progress value={item.percentage} className="h-2.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 