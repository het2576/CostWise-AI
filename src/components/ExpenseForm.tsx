import React, { useState } from 'react';
import { CategoryType } from '../types';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

interface ExpenseFormProps {
  onSubmit: (expense: {
    category: CategoryType;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
  categories: CategoryType[];
}

export function ExpenseForm({ onSubmit, categories }: ExpenseFormProps) {
  const [expense, setExpense] = useState({
    category: categories[0],
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(expense);
      
      // Reset form
      setExpense({
        category: categories[0],
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('Expense added successfully');
    } catch (error) {
      toast.error('Failed to add expense');
      console.error('Submit Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={expense.category}
            onChange={(e) => setExpense({ ...expense, category: e.target.value as CategoryType })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={expense.amount}
            onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={expense.description}
            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={expense.date}
            onChange={(e) => setExpense({ ...expense, date: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
} 