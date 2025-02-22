import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

export async function initializeSupabase() {
  try {
    // Test if tables exist by trying to select from them
    const { error: expenseError } = await supabase
      .from('expenses')
      .select('id')
      .limit(1);

    if (expenseError && expenseError.code === '42P01') {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc('create_tables', {
        sql: `
          -- Enable extensions
          create extension if not exists "uuid-ossp";

          -- Create expenses table
          create table if not exists expenses (
            id uuid default uuid_generate_v4() primary key,
            category text not null,
            amount decimal(10,2) not null,
            description text not null,
            date date not null,
            created_at timestamp with time zone default timezone('utc'::text, now())
          );

          -- Create budgets table
          create table if not exists budgets (
            id uuid default uuid_generate_v4() primary key,
            category text unique not null,
            amount decimal(10,2) not null,
            fiscal_year integer not null,
            quarter integer not null check (quarter between 1 and 4),
            created_at timestamp with time zone default timezone('utc'::text, now())
          );
        `
      });

      if (error) {
        console.error('Failed to create tables:', error);
        throw error;
      }
    }

    // Create analytics function
    const { error } = await supabase.rpc('create_analytics_function', {
      sql: `
        create or replace function get_expense_analytics()
        returns json
        language plpgsql
        security definer
        as $$
        declare
          result json;
        begin
          select json_build_object(
            'totalExpenses', coalesce((select sum(amount) from expenses), 0),
            'budgetUtilization', (
              select case 
                when sum(b.amount) > 0 
                then (sum(e.amount) / sum(b.amount)) * 100
                else 0
              end
              from expenses e
              cross join (select sum(amount) as amount from budgets) b
            ),
            'categoryBreakdown', coalesce(
              (select json_agg(
                json_build_object(
                  'category', category,
                  'total', sum(amount)
                )
              )
              from expenses
              group by category),
              '[]'::json
            ),
            'monthlyTrend', coalesce(
              (select json_agg(
                json_build_object(
                  'month', to_char(date_trunc('month', date), 'YYYY-MM'),
                  'expenses', sum(amount)
                )
              )
              from expenses
              group by date_trunc('month', date)
              order by date_trunc('month', date) desc
              limit 6),
              '[]'::json
            )
          ) into result;

          return result;
        end;
        $$;
      `
    });

    if (error) {
      console.error('Failed to create analytics function:', error);
      throw error;
    }

    console.log('Supabase initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
} 