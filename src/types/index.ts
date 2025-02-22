export type TimeframeType = 'Weekly' | 'Monthly' | 'Yearly';
export type CategoryType = 'Software' | 'Infrastructure' | 'Marketing' | 'Office' | 'Personnel';

export const TIMEFRAMES: TimeframeType[] = ['Weekly', 'Monthly', 'Yearly'];
export const CATEGORIES: CategoryType[] = ['Software', 'Infrastructure', 'Marketing', 'Office', 'Personnel'];

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

export interface AIRecommendation {
  title: string;
  description: string;
  savings: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  impact: string;
  timeframe: string;
  roi: number;
}

export interface AIAnalysis {
  recommendations: AIRecommendation[];
  insights: {
    summary: string;
    topSpendingAreas: string[];
    potentialSavings: number;
    riskAreas: string[];
  };
} 