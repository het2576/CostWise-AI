-- Enable necessary extensions
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

-- Create analytics function
create or replace function get_expense_analytics()
returns json
language plpgsql
as $$
declare
  result json;
begin
  select json_build_object(
    'totalExpenses', (select coalesce(sum(amount), 0) from expenses),
    'budgetUtilization', (
      select case 
        when sum(b.amount) > 0 
        then (sum(e.amount) / sum(b.amount)) * 100
        else 0
      end
      from expenses e
      cross join (select sum(amount) as amount from budgets) b
    ),
    'categoryBreakdown', (
      select json_agg(json_build_object(
        'category', category,
        'total', sum(amount)
      ))
      from expenses
      group by category
    ),
    'monthlyTrend', (
      select json_agg(json_build_object(
        'month', to_char(date_trunc('month', date), 'YYYY-MM'),
        'expenses', sum(amount)
      ))
      from expenses
      group by date_trunc('month', date)
      order by date_trunc('month', date) desc
      limit 6
    )
  ) into result;

  return result;
end;
$$; 