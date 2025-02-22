import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Moon, Sun, TrendingDown, LineChart, PieChart, BarChart3,
  Filter, Calendar, ArrowUpRight, ArrowDownRight, Zap,
  Settings, RefreshCw, DollarSign, TrendingUp, Loader2
} from 'lucide-react';
import { getAIRecommendations, getExpenseAnalysis } from './lib/gemini';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend,
} from 'recharts';
import { ExpenseForm } from './components/ExpenseForm';
import { expenseService } from './lib/expenseService';
import './styles/toast.css';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription';
import { 
  TimeframeType, 
  CategoryType, 
  TIMEFRAMES, 
  CATEGORIES,
  type Expense,
  type ExpenseAnalytics,
  type AIAnalysis
} from './types';
import { cn, formatCurrency, formatPercentage, getHealthStatus } from './lib/utils';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'recommendations'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('Monthly');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [aiData, setAiData] = useState<GeminiResponse | null>(null);
  const [expenseInsights, setExpenseInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [expensesData, analyticsData] = await Promise.all([
        expenseService.getExpenses(selectedTimeframe),
        expenseService.getAnalytics()
      ]);
      setExpenses(expensesData);
      setAnalytics(analyticsData);

      // Only fetch AI recommendations if we have expenses
      if (expensesData.length > 0) {
        try {
          const [recommendations, analysis] = await Promise.all([
            getAIRecommendations(expensesData),
            getExpenseAnalysis(expensesData, selectedTimeframe)
          ]);
          
          // Update both AI states
          setAiData(recommendations);
          setAiRecommendations(recommendations);
          setExpenseInsights(analysis);
        } catch (aiError) {
          console.error('AI Analysis Error:', aiError);
          toast.error('Failed to get AI recommendations. Using default suggestions.');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Fetch data error:', err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeframe]);

  // Set up real-time subscription
  useRealtimeSubscription(
    fetchData,
    (error) => {
      console.error('Subscription error:', error);
      toast.error('Real-time updates disconnected');
    }
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const filteredRecommendations = aiData?.recommendations.filter(
    rec => selectedCategory === 'All' || rec.category === selectedCategory
  ) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExpenseSubmit = async (expense: {
    category: CategoryType;
    amount: number;
    description: string;
    date: string;
  }) => {
    try {
      setIsLoading(true);
      await expenseService.addExpense(expense);
      toast.success('Expense added successfully');
      await fetchData(); // Real-time subscription will handle the update
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground transition-colors duration-300",
      isDarkMode ? 'dark' : ''
    )}>
      <Toaster position="top-right" />
      <nav className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Cost-Cutting AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                <Filter className="h-4 w-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryType | 'All')}
                  className="bg-transparent border-none text-sm focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                <Calendar className="h-4 w-4" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as TimeframeType)}
                  className="bg-transparent border-none text-sm focus:outline-none"
                >
                  {TIMEFRAMES.map((timeframe) => (
                    <option key={timeframe} value={timeframe}>{timeframe}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedView('overview')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              selectedView === 'overview' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            )}
          >
            <PieChart className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('trends')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              selectedView === 'trends' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            )}
          >
            <LineChart className="h-4 w-4" />
            Trends
          </button>
          <button
            onClick={() => setSelectedView('recommendations')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              selectedView === 'recommendations' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            )}
          >
            <Zap className="h-4 w-4" />
            AI Recommendations
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-danger/10 text-danger p-4 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Expense Form */}
            <ExpenseForm
              onSubmit={handleExpenseSubmit}
              categories={CATEGORIES}
            />

            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(analytics.totalExpenses)}</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={cn(
                      "flex items-center",
                      analytics.monthlyTrend[0]?.expenses > analytics.monthlyTrend[1]?.expenses
                        ? "text-danger"
                        : "text-success"
                    )}>
                      {analytics.monthlyTrend[0]?.expenses > analytics.monthlyTrend[1]?.expenses ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {formatPercentage(
                        ((analytics.monthlyTrend[0]?.expenses - analytics.monthlyTrend[1]?.expenses) /
                          analytics.monthlyTrend[1]?.expenses) * 100
                      )}
                    </span>
                    <span className="text-muted-foreground ml-2">vs last month</span>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Budget Utilization</h3>
                  <p className="text-2xl font-bold mt-2">{formatPercentage(analytics.budgetUtilization)}</p>
                  <div className="mt-4">
                    <div className="h-2 bg-secondary rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          getHealthStatus(analytics.budgetUtilization, 100)
                        )}
                        style={{ width: `${Math.min(analytics.budgetUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Top Categories</h3>
                  <div className="mt-4 space-y-3">
                    {analytics.categoryBreakdown.slice(0, 3).map((category) => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="text-sm">{category.category}</span>
                        <span className="font-medium">{formatCurrency(category.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Monthly Trend</h3>
                  <div className="h-[100px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthlyTrend}>
                        <defs>
                          <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#trend)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {selectedView === 'trends' && analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.categoryBreakdown || []}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {(analytics.categoryBreakdown || []).map((entry, index) => (
                            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="expenses" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {selectedView === 'recommendations' && analytics?.recommendations && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    layoutId={`rec-${index}`}
                    className="bg-card p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowDetails(showDetails === index ? null : index)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        rec.priority === 'high' ? 'bg-danger text-danger-foreground' :
                        rec.priority === 'medium' ? 'bg-warning text-warning-foreground' :
                        'bg-success text-success-foreground'
                      )}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                    
                    <AnimatePresence>
                      {showDetails === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mb-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Impact</p>
                              <p className="font-medium">{rec.impact}</p>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Timeline</p>
                              <p className="font-medium">{rec.timeframe}</p>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">ROI</p>
                              <p className="font-medium">{rec.roi}%</p>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Category</p>
                              <p className="font-medium">{rec.category}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center">
                      <span className="text-success font-semibold">
                        Save {formatCurrency(rec.savings)}/year
                      </span>
                      <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                        {rec.action}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {aiRecommendations && (
          <div className="mt-6 p-4 bg-card rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {aiRecommendations.recommendations?.map((rec: any, index: number) => (
                <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold text-lg">{rec.title}</h4>
                  <p className="text-muted-foreground">{rec.description}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-success">Save ${rec.savings}</span>
                    <span className="text-muted-foreground">ROI: {rec.roi}%</span>
                  </div>
                </div>
              ))}
            </div>
            {aiRecommendations.insights && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold">Insights</h4>
                <p>{aiRecommendations.insights.summary}</p>
                <p className="text-success mt-2">
                  Potential Savings: ${aiRecommendations.insights.potentialSavings}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;