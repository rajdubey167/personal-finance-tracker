"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface BudgetData {
  category: string;
  budget: number;
  actual: number;
  remaining: number;
}

interface BudgetVsActualChartProps {
  data: BudgetData[];
}

const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.category,
      Budget: item.budget,
      Actual: item.actual,
      Remaining: item.remaining,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No budget data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label: string) => `Category: ${label}`}
            />
            <Legend />
            <Bar dataKey="Budget" fill="#3b82f6" />
            <Bar dataKey="Actual" fill="#ef4444" />
            <Bar dataKey="Remaining" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

BudgetVsActualChart.displayName = 'BudgetVsActualChart';

export default BudgetVsActualChart; 