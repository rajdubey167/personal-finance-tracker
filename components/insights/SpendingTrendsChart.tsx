"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface SpendingTrendsChartProps {
  transactions: Transaction[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
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

    return Array.from(monthlyTotals.entries())
      .map(([month, totals]) => ({
        month,
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends Over Time</CardTitle>
          <p className="text-sm text-gray-600">
            Track your income and expenses trends
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Income"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="Expenses"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Net"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Month-wise details outside the card */}
      <div className="px-6 pb-6 mt-8">
        <div className="space-y-4">
          {/* First 6 months in one horizontal line */}
          <div className="grid grid-cols-6 gap-2">
            {chartData.slice(0, 6).map((item) => (
              <div key={item.month} className="flex flex-col p-2 bg-gray-50 rounded text-xs">
                <div className="font-semibold text-gray-900 mb-1 text-center text-xs">
                  {item.month}
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">I:</span>
                    <span className="font-medium text-green-600 text-xs">
                      ${item.income.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">E:</span>
                    <span className="font-medium text-red-600 text-xs">
                      ${item.expenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-0.5">
                    <span className="text-gray-500 text-xs">N:</span>
                    <span className={`font-medium text-xs ${item.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${item.net.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second 6 months in another horizontal line */}
          <div className="grid grid-cols-6 gap-2">
            {chartData.slice(6, 12).map((item) => (
              <div key={item.month} className="flex flex-col p-2 bg-gray-50 rounded text-xs">
                <div className="font-semibold text-gray-900 mb-1 text-center text-xs">
                  {item.month}
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">I:</span>
                    <span className="font-medium text-green-600 text-xs">
                      ${item.income.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">E:</span>
                    <span className="font-medium text-red-600 text-xs">
                      ${item.expenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-0.5">
                    <span className="text-gray-500 text-xs">N:</span>
                    <span className={`font-medium text-xs ${item.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${item.net.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

SpendingTrendsChart.displayName = 'SpendingTrendsChart';

export default SpendingTrendsChart; 