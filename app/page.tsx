"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Target, Plus, Sparkles } from 'lucide-react';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import TransactionForm from '@/components/TransactionForm';
import { useTransactions } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const { transactions, isLoading, mutate } = useTransactions();

  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, Date>();
    transactions.forEach(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      monthMap.set(monthKey, monthStart);
    });
    return Array.from(monthMap.entries())
      .sort(([, a], [, b]) => b.getTime() - a.getTime())
      .map(([monthKey]) => monthKey);
  }, [transactions]);

  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    console.log('Dashboard - selectedMonth:', selectedMonth);
    console.log('Dashboard - transactions count:', transactions.length);
    
    if (selectedMonth === 'all') {
      console.log('Dashboard - returning all transactions');
      return transactions;
    }
    
    const filtered = transactions.filter(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      return monthKey === selectedMonth;
    });
    
    console.log('Dashboard - filtered transactions count:', filtered.length);
    return filtered;
  }, [transactions, selectedMonth]);

  // Calculate stats from filtered transactions
  const stats = filteredTransactions.reduce(
    (acc, transaction) => {
      const amount = Math.abs(transaction.amount);
      if (transaction.type === 'expense') {
        acc.totalExpenses += amount;
      } else {
        acc.totalIncome += amount;
      }
      return acc;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );

  // Calculate top category from filtered transactions
  const categoryTotals = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0] || ['None', 0];

  const topCategoryPercentage = stats.totalExpenses > 0
    ? (topCategory[1] / stats.totalExpenses) * 100
    : 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 relative">

      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 shadow-2xl" style={{ background: '#C8E4CE' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm border border-white/40">
              <Sparkles className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800">
                Welcome back!
              </h1>
              <p className="text-gray-700 text-lg">
                Here&apos;s your financial overview
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalIncome)}</div>
                <div className="text-gray-700 text-sm">Total Income</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-gray-700 text-sm">Total Expenses</div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-white/40 hover:bg-white/60 backdrop-blur-sm border-white/50 text-gray-800 shadow-lg font-semibold"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Add New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={() => setIsDialogOpen(false)} mutate={mutate} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600">Track your spending and income patterns</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px] bg-white shadow-sm">
            <SelectValue>
              {selectedMonth === 'all' ? 'All Time' : selectedMonth}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
            <div className="p-2 bg-red-200 rounded-lg group-hover:bg-red-300 transition-colors">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {formatCurrency(stats.totalExpenses)}
            </div>
            {stats.totalIncome > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {((stats.totalExpenses / stats.totalIncome) * 100).toFixed(1)}% of income
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
            <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Available for spending
            </p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Top Spending Category</CardTitle>
            <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {topCategory[0]}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {topCategoryPercentage.toFixed(1)}% of expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyExpensesChart />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList limit={5} showActions={false} />
        </CardContent>
      </Card>
    </div>
  );
}
