"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '@/lib/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

const Chart = dynamic(() => import('recharts').then((mod) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
  const ChartComponent = ({ data }: { data: Array<{month: string; income: number; expenses: number}> }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
        />
        <Bar 
          dataKey="income" 
          stackId="a" 
          fill="#16a34a" 
          name="Income"
          style={{ cursor: 'pointer' }}
        />
        <Bar 
          dataKey="expenses" 
          stackId="a" 
          fill="#dc2626" 
          name="Expenses"
          style={{ cursor: 'pointer' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
  ChartComponent.displayName = 'ChartComponent';
  return ChartComponent;
}), { 
  ssr: false,
  loading: () => <div className="h-[450px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
});

interface MonthBreakdown {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  topCategory: string;
  topCategoryAmount: number;
}

const MonthlyExpensesChart: React.FC = () => {
  const { transactions, isLoading } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState<MonthBreakdown | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthlyData = useMemo(() => {
    if (!transactions.length) return [];

    const monthlyTotals = new Map<string, { income: number; expenses: number }>();
    
    transactions.forEach(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      const amount = Math.abs(transaction.amount);
      
      if (!monthlyTotals.has(monthKey)) {
        monthlyTotals.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const current = monthlyTotals.get(monthKey)!;
      if (transaction.type === 'income') {
        current.income += amount;
      } else {
        current.expenses += amount;
      }
    });

    const data = Array.from(monthlyTotals.entries())
      .map(([month, totals]) => ({
        month,
        income: totals.income,
        expenses: totals.expenses,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    return data;
  }, [transactions]);

  const handleBarClick = (month: string) => {
    const monthTransactions = transactions.filter(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      return monthKey === month;
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryTotals = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0] || ['None', 0];

    setSelectedMonth({
      month,
      totalIncome,
      totalExpenses,
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1],
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]">
            {monthlyData.length > 0 ? (
              <Chart data={monthlyData} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No transaction data available
              </div>
            )}
          </div>
          
          {monthlyData.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Summary</h3>
              <div className="grid grid-cols-6 gap-2">
                {monthlyData.map((monthData) => {
                  return (
                    <div 
                      key={monthData.month} 
                      className="p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-xs"
                      onClick={() => handleBarClick(monthData.month)}
                    >
                      <div className="text-center mb-1">
                        <span className="font-medium text-gray-900">
                          {monthData.month}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">I:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(monthData.income)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">E:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(monthData.expenses)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMonth?.month} Breakdown</DialogTitle>
          </DialogHeader>
          {selectedMonth && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedMonth.totalIncome)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedMonth.totalExpenses)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMonth.topCategory}</div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(selectedMonth.topCategoryAmount)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

MonthlyExpensesChart.displayName = 'MonthlyExpensesChart';

export default MonthlyExpensesChart; 