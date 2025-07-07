"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TransactionForm from './TransactionForm';
import { Pencil, Trash, TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactions } from '@/lib/hooks';
import { useToast } from '@/components/ui/use-toast';

interface TransactionListProps {
  limit?: number;
  showAll?: boolean;
  showActions?: boolean;
  transactions?: Transaction[];
}

export default function TransactionList({ 
  limit, 
  showAll, 
  showActions = true, 
  transactions: propTransactions 
}: TransactionListProps) {
  const [isClient, setIsClient] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { transactions: hookTransactions, mutate } = useTransactions(showAll ? undefined : limit);
  const { toast } = useToast();
  
  const transactions = propTransactions || hookTransactions;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast({
        title: "Deleted! 🗑️",
        description: "Transaction deleted successfully",
        variant: "success",
      });
      mutate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error! ❌",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    mutate();
  };

  if (!isClient) {
    return null;
  }

  if (!propTransactions && hookTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const TableComponent = () => (
    <Table className="w-full">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200">
          <TableHead className="text-lg font-bold text-gray-800 py-6 px-6">Date & Type</TableHead>
          <TableHead className="text-lg font-bold text-gray-800 py-6 px-6">Description</TableHead>
          <TableHead className="text-lg font-bold text-gray-800 py-6 px-6">Category</TableHead>
          <TableHead className="text-lg font-bold text-gray-800 py-6 px-6 text-right">Amount</TableHead>
          {showActions && <TableHead className="text-lg font-bold text-gray-800 py-6 px-6 text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow 
            key={transaction._id}
            className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer border-b border-gray-100/50 hover:border-blue-200/50 transform hover:scale-[1.01] hover:shadow-lg"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TableCell className="py-6 px-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl shadow-sm ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700 border border-red-200'
                } transition-all duration-300 group-hover:scale-110`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {format(parseISO(transaction.date), 'MMM d, yyyy')}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {transaction.type}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="py-6 px-6">
              <div className="max-w-xs">
                <span className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                  {transaction.description}
                </span>
              </div>
            </TableCell>
            <TableCell className="py-6 px-6">
              <Badge 
                variant={transaction.type === 'income' ? 'default' : 'secondary'}
                className={`text-sm px-4 py-2 font-semibold rounded-full shadow-sm ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border border-green-200' 
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 hover:from-gray-200 hover:to-slate-200 border border-gray-200'
                } transition-all duration-300 group-hover:scale-105`}
              >
                {transaction.category}
              </Badge>
            </TableCell>
            <TableCell className={`py-6 px-6 text-right ${
              transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
            }`}>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold group-hover:scale-105 transition-transform duration-300">
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
                <span className={`text-xs font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>
            </TableCell>
            {showActions && (
              <TableCell className="py-6 px-6 text-right">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(transaction);
                    }}
                    className="bg-white/80 backdrop-blur-sm hover:bg-blue-50 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(transaction._id);
                    }}
                    className="bg-red-50/80 backdrop-blur-sm hover:bg-red-100 border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={showActions ? 5 : 4} className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-xl font-semibold text-gray-600">
                  No transactions found
                </div>
                <div className="text-gray-500">
                  Start by adding your first transaction
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      {showAll ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden backdrop-blur-sm">
          <TableComponent />
        </div>
      ) : showActions ? (
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-b-0">
            <CardTitle className="text-2xl font-bold flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span>Transaction History</span>
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Track your income and expenses with detailed insights
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <TableComponent />
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent />
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              mode="edit"
              transaction={editingTransaction}
              onSuccess={handleEditSuccess}
              mutate={mutate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 