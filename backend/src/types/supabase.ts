export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          description: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          description?: string
          date?: string
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          category: string
          amount: number
          fiscal_year: number
          quarter: number
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          fiscal_year: number
          quarter: number
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          fiscal_year?: number
          quarter?: number
          created_at?: string
        }
      }
    }
    Functions: {
      get_expense_analytics: {
        Args: Record<string, never>
        Returns: Json
      }
      create_expenses_table: {
        Args: Record<string, never>
        Returns: void
      }
      create_budgets_table: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
} 