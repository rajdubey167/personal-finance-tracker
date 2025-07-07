"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Receipt, Filter, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '@/lib/hooks';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { transactions, isLoading, mutate } = useTransactions();

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

  const filteredTransactions = useMemo(() => {
    console.log('Transactions - selectedMonth:', selectedMonth);
    console.log('Transactions - selectedType:', selectedType);
    console.log('Transactions - transactions count:', transactions.length);
    
    let filtered = transactions;
    
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(transaction => {
        const date = parseISO(transaction.date);
        const monthKey = format(date, 'MMM yyyy');
        return monthKey === selectedMonth;
      });
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => {
        if (selectedType === 'income') {
          return transaction.type === 'income';
        } else if (selectedType === 'spent') {
          return transaction.type === 'expense';
        }
        return true;
      });
    }
    
    console.log('Transactions - filtered transactions count:', filtered.length);
    return filtered;
  }, [transactions, selectedMonth, selectedType]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce(
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
  }, [filteredTransactions]);

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
      <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 shadow-2xl" style={{ background: '#D1ECF1' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm border border-white/40">
              <Receipt className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800">
                Transactions
              </h1>
              <p className="text-gray-700 text-lg">
                Manage your income and expenses
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
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalIncome)}</div>
                <div className="text-gray-700 text-sm">Total Income</div>
              </div>
              <div className="w-px h-12 bg-gray-600/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</div>
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
      <Card className="border-0 shadow-md bg-gradient-to-r from-gray-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Month:</span>
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
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700">Type:</span>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[120px] bg-white shadow-sm">
                    <SelectValue>
                      {selectedType === 'all' ? 'All' : 
                       selectedType === 'income' ? 'Income' : 'Spent'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="spent">Spent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                {selectedMonth !== 'all' && ` for ${selectedMonth}`}
                {selectedType !== 'all' && ` (${selectedType === 'income' ? 'Income' : 'Spent'})`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList showAll transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  );
} 