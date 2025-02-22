import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function useRealtimeSubscription(
  onExpenseUpdate: () => void,
  onError: (error: Error) => void
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const setupSubscription = useCallback(async () => {
    try {
      // Clean up existing subscription
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
      }

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      channelRef.current = supabase.channel('expense-changes', {
        config: {
          broadcast: { ack: true }
        }
      });

      if (!channelRef.current) {
        throw new Error('Failed to create channel');
      }

      channelRef.current
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses'
          },
          (payload) => {
            console.log('Change received:', payload);
            onExpenseUpdate();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to expense changes');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log(`Subscription ${status}, attempting to reconnect...`);
            // Attempt to reconnect after a delay
            retryTimeoutRef.current = setTimeout(() => {
              setupSubscription();
            }, 5000);
          }

          if (err) {
            console.error('Subscription error:', err);
            onError(new Error(`Subscription error: ${err.message}`));
          }
        });
    } catch (error) {
      console.error('Error setting up subscription:', error);
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [onExpenseUpdate, onError]);

  useEffect(() => {
    setupSubscription();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [setupSubscription]);
} 