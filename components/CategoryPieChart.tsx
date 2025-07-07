"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

// Different color palette for dashboard
const COLORS = [
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 categories
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <p className="text-sm text-gray-600">
            Total spent: {formatCurrency(totalSpent)}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percentage }) => `${name} (${typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                labelFormatter={(label: string) => `Category: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Category details outside the card */}
      <div className="px-6 pb-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded text-xs">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-700 truncate">{item.name}</span>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <div className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  ${item.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

CategoryPieChart.displayName = 'CategoryPieChart';

export default CategoryPieChart; 