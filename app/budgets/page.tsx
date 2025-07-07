"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import BudgetList from '@/components/BudgetList';
import BudgetForm from '@/components/BudgetForm';
import BudgetSummary from '@/components/BudgetSummary';
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, PiggyBank, Filter, Calendar, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudgetsWithProgress } from '@/lib/hooks';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { formatCurrency } from '@/lib/utils';

type ViewMode = 'all' | 'monthly' | 'category';

export default function BudgetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const { budgetsWithProgress, isLoading, mutate } = useBudgetsWithProgress(selectedMonth);

  // Generate available months (6 months back, current month, and 6 months forward)
  const availableMonths = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    // Add 6 previous months
    for (let i = 6; i > 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');
      months.push({ key: monthKey, label: monthLabel, isPast: true });
    }
    
    // Add current month
    const currentMonthKey = format(currentDate, 'yyyy-MM');
    const currentMonthLabel = format(currentDate, 'MMM yyyy');
    months.push({ key: currentMonthKey, label: currentMonthLabel, isPast: false, isCurrent: true });
    
    // Add 6 future months
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');
      months.push({ key: monthKey, label: monthLabel, isPast: false });
    }
    
    return months;
  }, []);

  // Filter budgets based on view mode
  const filteredBudgets = useMemo(() => {
    switch (viewMode) {
      case 'monthly':
        return budgetsWithProgress.filter(budget => !budget.category);
      case 'category':
        return budgetsWithProgress.filter(budget => budget.category);
      default:
        return budgetsWithProgress;
    }
  }, [budgetsWithProgress, viewMode]);

  const handleRefresh = () => {
    mutate();
  };

  // Calculate budget stats
  const budgetStats = useMemo(() => {
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      utilizationRate,
      budgetCount: filteredBudgets.length
    };
  }, [filteredBudgets]);

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
      <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 shadow-2xl" style={{ background: '#F3E5F5' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm border border-white/40">
              <PiggyBank className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800">
                Budget Management
              </h1>
              <p className="text-gray-700 text-lg">
                Set and track your monthly spending budgets
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{budgetStats.budgetCount}</div>
                <div className="text-gray-700 text-sm">Active Budgets</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(budgetStats.totalBudget)}</div>
                <div className="text-gray-700 text-sm">Total Budget</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{budgetStats.utilizationRate.toFixed(1)}%</div>
                <div className="text-gray-700 text-sm">Utilization</div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-white/40 hover:bg-white/60 backdrop-blur-sm border-white/50 text-gray-800 shadow-lg font-semibold"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Add New Budget</DialogTitle>
                </DialogHeader>
                <BudgetForm onSuccess={() => setIsDialogOpen(false)} mutate={mutate} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-gray-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Month:</span>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px] bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem 
                        key={month.key} 
                        value={month.key}
                        className={`hover:bg-gray-100 transition-colors duration-200 ${
                          month.isCurrent ? 'font-semibold text-blue-600' : 
                          month.isPast ? 'text-gray-600' : 'text-gray-800'
                        }`}
                      >
                        {month.label}
                        {month.isCurrent && ' (Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">View:</span>
                <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                  <SelectTrigger className="w-[150px] bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200">
                    <SelectValue placeholder="Select View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="hover:bg-gray-100 transition-colors duration-200">All Budgets</SelectItem>
                    <SelectItem value="monthly" className="hover:bg-gray-100 transition-colors duration-200">Monthly Only</SelectItem>
                    <SelectItem value="category" className="hover:bg-gray-100 transition-colors duration-200">Category Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''} for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border-gray-200 hover:border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <BudgetSummary budgets={filteredBudgets} viewMode={viewMode} />

      {/* Budget vs Actual Chart - Only show if there are budgets */}
      {filteredBudgets.length > 0 && (
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetVsActualChart 
              data={filteredBudgets.map(budget => ({
                category: budget.category || budget.name,
                budget: budget.amount,
                actual: budget.spent || 0,
                remaining: budget.amount - (budget.spent || 0)
              }))} 
            />
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetList budgets={filteredBudgets} onRefresh={handleRefresh} viewMode={viewMode} mutate={mutate} />
        </CardContent>
      </Card>
    </div>
  );
} 