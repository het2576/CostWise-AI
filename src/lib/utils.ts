import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`;
}

export function getHealthStatus(current: number, budget: number): 'success' | 'warning' | 'danger' {
  const ratio = current / budget;
  if (ratio <= 0.8) return 'success';
  if (ratio <= 0.95) return 'warning';
  return 'danger';
}

export function calculateROI(savings: number, cost: number): number {
  return Math.round((savings / cost) * 100);
}

export function getTrendIcon(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'increasing':
      return '↗️';
    case 'decreasing':
      return '↘️';
    default:
      return '→';
  }
}

export function getTimeframeMultiplier(timeframe: string): number {
  switch (timeframe.toLowerCase()) {
    case 'weekly':
      return 1/52;
    case 'monthly':
      return 1/12;
    case 'yearly':
      return 1;
    default:
      return 1;
  }
}