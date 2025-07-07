"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Target, Lightbulb } from 'lucide-react';
import CategorySpendingChart from '@/components/insights/CategorySpendingChart';
import MonthlyComparisonChart from '@/components/insights/MonthlyComparisonChart';
import SpendingTrendsChart from '@/components/insights/SpendingTrendsChart';
import TopSpendingCategories from '@/components/insights/TopSpendingCategories';
import SpendingInsights from '@/components/insights/SpendingInsights';
import { useTransactions } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';
import { format, subMonths } from 'date-fns';

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');
  const { transactions, isLoading } = useTransactions();

  // Generate available periods
  const availablePeriods = useMemo(() => {
    const periods = [
      { value: '3', label: 'Last 3 Months' },
      { value: '6', label: 'Last 6 Months' },
      { value: '12', label: 'Last 12 Months' },
    ];

    // Add individual months (last 6 months)
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMMM yyyy');
      periods.push({ value: monthKey, label: monthLabel });
    }

    return periods;
  }, []);

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    console.log('Insights - all transactions:', transactions);
    console.log('Insights - selectedPeriod:', selectedPeriod);
    
    if (!transactions.length) return [];
    
    // Check if selectedPeriod is a month (YYYY-MM format) or duration
    if (selectedPeriod.includes('-')) {
      // Specific month selected
      const [year, month] = selectedPeriod.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      console.log('Insights - filtered for month:', filtered);
      return filtered;
    } else {
      // Duration selected (3, 6, 12 months)
      const monthsAgo = parseInt(selectedPeriod);
      const cutoffDate = subMonths(new Date(), monthsAgo);
      
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= cutoffDate;
      });
      
      console.log('Insights - filtered for duration:', filtered);
      return filtered;
    }
  }, [transactions, selectedPeriod]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!filteredTransactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        topCategory: null,
        topCategoryAmount: 0,
        expenseCount: 0,
        incomeCount: 0,
      };
    }

    const income = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    console.log('Sample transactions:', {
      all: filteredTransactions.slice(0, 3),
      income: income.slice(0, 3),
      expenses: expenses.slice(0, 3)
    });
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    
    console.log('Insights calculation:', {
      totalIncome,
      totalExpenses,
      netSavings,
      incomeCount: income.length,
      expenseCount: expenses.length
    });
    
    // Calculate monthly averages
    let monthsCount = 1; // Default for single month
    if (!selectedPeriod.includes('-')) {
      monthsCount = parseInt(selectedPeriod);
    }
    const averageMonthlyIncome = totalIncome / monthsCount;
    const averageMonthlyExpenses = totalExpenses / monthsCount;
    
    // Find top spending category
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      topCategory: topCategory ? topCategory[0] : null,
      topCategoryAmount: topCategory ? topCategory[1] : 0,
      expenseCount: expenses.length,
      incomeCount: income.length,
    };
  }, [filteredTransactions, selectedPeriod]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">

      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 shadow-2xl" style={{ background: '#FFE0B2' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm border border-white/40">
              <TrendingUp className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800">
                Financial Insights
              </h1>
              <p className="text-gray-700 text-lg">
                Analyze your spending patterns and trends
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{filteredTransactions.length}</div>
                <div className="text-gray-700 text-sm">Total Transactions</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(insights.totalIncome)}</div>
                <div className="text-gray-700 text-sm">Total Income</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(insights.totalExpenses)}</div>
                <div className="text-gray-700 text-sm">Total Expenses</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(insights.netSavings)}</div>
                <div className="text-gray-700 text-sm">Net Savings</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40 bg-white/40 backdrop-blur-sm border-white/50 text-gray-800">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
            <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(insights.totalIncome)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-green-600">
                Avg: {formatCurrency(insights.averageMonthlyIncome)}/month
              </p>
              <Badge variant="secondary" className="text-xs bg-green-200 text-green-700">
                +{insights.incomeCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
            <div className="p-2 bg-red-200 rounded-lg group-hover:bg-red-300 transition-colors">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {formatCurrency(insights.totalExpenses)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-red-600">
                Avg: {formatCurrency(insights.averageMonthlyExpenses)}/month
              </p>
              <Badge variant="secondary" className="text-xs bg-red-200 text-red-700">
                -{insights.expenseCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Net Savings</CardTitle>
            <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${insights.netSavings >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(insights.netSavings)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {insights.netSavings >= 0 ? 'Positive savings' : 'Negative savings'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Top Category</CardTitle>
            <div className="p-2 bg-purple-200 rounded-lg group-hover:bg-purple-300 transition-colors">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {insights.topCategory || 'None'}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {formatCurrency(insights.topCategoryAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Spending Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingTrendsChart transactions={filteredTransactions} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-green-600" />
              <span>Category Spending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategorySpendingChart transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyComparisonChart transactions={filteredTransactions} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSpendingCategories transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Smart Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingInsights insights={insights} transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  );
} 