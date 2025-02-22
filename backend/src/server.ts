import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupWebSocket } from './services/websocket';
import { supabase, initializeSupabase } from './lib/supabase';
import { validateExpense } from './middleware/validation';
import { analyzeExpenses } from './services/aiAnalysis';
import WebSocket from 'ws';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.post('/api/expenses', validateExpense, async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;
    
    const { data: expense, error: insertError } = await supabase
      .from('expenses')
      .insert([{ category, amount, description, date }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Get all expenses for analysis
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    const analysis = await analyzeExpenses(expenses || []);

    // Get analytics data
    const { data: analytics } = await supabase.rpc('get_expense_analytics');

    const response = {
      expense,
      analysis,
      analytics
    };

    res.status(201).json(response);

    // Notify WebSocket clients
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'update',
            data: response
          }));
        }
      });
    }
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ 
      error: 'Failed to create expense',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const { timeframe, category } = req.query;
    let query = supabase.from('expenses').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (timeframe === 'weekly') {
      query = query.gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (timeframe === 'monthly') {
      query = query.gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data: expenses, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('*');

    if (expenseError) throw expenseError;

    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_expense_analytics');

    if (analyticsError) throw analyticsError;

    const aiAnalysis = await analyzeExpenses(expenses || []);

    res.json({
      ...analytics,
      recommendations: aiAnalysis.recommendations,
      insights: aiAnalysis.insights
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Initialize server
async function initServer() {
  try {
    const initialized = await initializeSupabase();
    if (!initialized) {
      throw new Error('Failed to initialize Supabase');
    }

    const server = createServer(app);
    const wss = setupWebSocket(server, supabase);
    app.set('wss', wss);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

initServer(); 