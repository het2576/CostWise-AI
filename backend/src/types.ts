export interface IExpense {
  id?: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
}

export interface IAIAnalysis {
  recommendations: Array<{
    title: string;
    description: string;
    savings: number;
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
    timeframe: string;
    roi: number;
  }>;
  insights: {
    summary: string;
    topSpendingAreas: string[];
    potentialSavings: number;
    riskAreas: string[];
  };
} 