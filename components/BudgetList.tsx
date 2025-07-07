"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { BudgetWithProgress } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BudgetForm from './BudgetForm';
import { Pencil, Trash, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type ViewMode = 'all' | 'monthly' | 'category';

interface BudgetListProps {
  budgets: BudgetWithProgress[];
  onRefresh: () => void;
  viewMode?: ViewMode;
  mutate?: () => void;
}

export default function BudgetList({ budgets, onRefresh, viewMode = 'all', mutate }: BudgetListProps) {
  const [editingBudget, setEditingBudget] = useState<BudgetWithProgress | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEdit = (budget: BudgetWithProgress) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      toast({
        title: "Deleted! 🗑️",
        description: "Budget deleted successfully",
        variant: "success",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error! ❌",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onRefresh();
  };

  const getStatusIcon = (status: 'under' | 'over' | 'at') => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'at':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: 'under' | 'over' | 'at') => {
    switch (status) {
      case 'over':
        return 'text-red-600';
      case 'at':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const getBudgetTypeIcon = (budget: BudgetWithProgress) => {
    if (budget.category) {
      return <span className="text-sm text-muted-foreground">#{budget.category}</span>;
    } else {
      return <DollarSign className="h-4 w-4 text-purple-500" />;
    }
  };

  const getBudgetTypeLabel = (budget: BudgetWithProgress) => {
    if (budget.category) {
      return 'Category Budget';
    } else {
      return 'Monthly Budget';
    }
  };

  const getListTitle = () => {
    switch (viewMode) {
      case 'monthly':
        return 'Monthly Budgets';
      case 'category':
        return 'Category Budgets';
      default:
        return 'All Budgets';
    }
  };

  const getEmptyMessage = () => {
    switch (viewMode) {
      case 'monthly':
        return 'No monthly budgets set for this period.';
      case 'category':
        return 'No category budgets set for this period.';
      default:
        return 'No budgets set for this period.';
    }
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getListTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{getEmptyMessage()}</p>
            <p className="text-sm">Create a budget to start tracking your spending.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{getListTitle()}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} for this period
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <Card key={budget._id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getBudgetTypeIcon(budget)}
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        {budget.category && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {budget.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getBudgetTypeLabel(budget)}
                            </Badge>
                          </div>
                        )}
                        {!budget.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {getBudgetTypeLabel(budget)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(budget.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(budget._id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span className="font-medium">{formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spent</span>
                      <span className="font-medium">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining</span>
                      <span className={`font-medium ${getStatusColor(budget.status)}`}>
                        {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-center">
                      <Badge variant={budget.status === 'over' ? 'destructive' : 'secondary'}>
                        {budget.status === 'over' ? 'Over Budget' : 
                         budget.status === 'at' ? 'At Budget' : 'Under Budget'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              mode="edit"
              budget={editingBudget}
              onSuccess={handleEditSuccess}
              mutate={mutate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 