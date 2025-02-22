export type CategoryType = 'Software' | 'Infrastructure' | 'Marketing' | 'Office' | 'Personnel';

export interface IExpense {
  category: CategoryType;
  amount: number;
  description: string;
  date: Date;
  budget?: number;
  tags?: string[];
  supplier?: string;
  paymentMethod?: string;
  approvedBy?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface IBudget {
  category: CategoryType;
  amount: number;
  fiscalYear: number;
  quarter: number;
  alerts?: {
    threshold: number;
    email?: string;
  };
} 