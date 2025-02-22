import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../backend/src/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey?.slice(0, 10) + '...');
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      },
      heartbeat: {
        interval: 5000,
        timeout: 7000
      }
    }
  }
); 