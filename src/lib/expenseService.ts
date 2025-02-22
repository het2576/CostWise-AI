import { supabase } from './supabase';
import { CategoryType, type Expense, type ExpenseAnalytics } from '../types';

export interface Expense {
  id?: string;
  category: CategoryType;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  budgetUtilization: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    expenses: number;
  }>;
}

export const expenseService = {
  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error('Add expense error:', error);
      throw new Error(`Failed to add expense: ${error.message}`);
    }

    return data;
  },

  async getExpenses(timeframe: string = 'monthly'): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    const now = new Date();
    if (timeframe === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('date', weekAgo.toISOString().split('T')[0]);
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('date', monthAgo.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get expenses error:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return data || [];
  },

  async getAnalytics(): Promise<ExpenseAnalytics> {
    const { data, error } = await supabase.rpc('get_expense_analytics');

    if (error) {
      console.error('Get analytics error:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    if (!data) {
      throw new Error('No analytics data returned');
    }

    return data;
  },

  async updateBudget(category: CategoryType, amount: number): Promise<void> {
    const fiscalYear = new Date().getFullYear();
    const quarter = Math.floor((new Date().getMonth() / 3)) + 1;

    const { error } = await supabase
      .from('budgets')
      .upsert({
        category,
        amount,
        fiscal_year: fiscalYear,
        quarter
      });

    if (error) {
      console.error('Update budget error:', error);
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  },

  async getBudgets(): Promise<Record<CategoryType, number>> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');

    if (error) {
      console.error('Get budgets error:', error);
      throw new Error(`Failed to fetch budgets: ${error.message}`);
    }

    return (data || []).reduce((acc, budget) => {
      acc[budget.category as CategoryType] = budget.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  }
}; 