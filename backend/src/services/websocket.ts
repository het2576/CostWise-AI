import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { SupabaseClient } from '@supabase/supabase-js';
import { analyzeExpenses } from './aiAnalysis';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

export function setupWebSocket(server: Server, supabase: SupabaseClient) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: ExtendedWebSocket) => {
    console.log('Client connected');

    try {
      await sendUpdates(ws, supabase);

      const interval = setInterval(async () => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            await sendUpdates(ws, supabase);
          } catch (error) {
            console.error('Update interval error:', error);
          }
        }
      }, 30000);

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        clearInterval(interval);
      });
    } catch (error) {
      console.error('WebSocket connection setup error:', error);
    }
  });

  return wss;
}

async function sendUpdates(ws: ExtendedWebSocket, supabase: SupabaseClient) {
  try {
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (expenseError) throw expenseError;

    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_expense_analytics');

    if (analyticsError) throw analyticsError;

    const analysis = await analyzeExpenses(expenses || []);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        data: {
          expenses,
          analytics,
          analysis
        }
      }));
    }
  } catch (error) {
    console.error('WebSocket update error:', error);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to fetch updates'
      }));
    }
  }
} 