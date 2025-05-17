
import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { unsubscribe } from '@/utils/supabaseApi';

export function useRealtimeData<T>(
  initialData: T[],
  fetchFunction: () => Promise<T[]>,
  subscribeFunction: (callback: any, branchId?: number) => RealtimeChannel,
  dependencyArray: any[] = []
): {
  data: T[];
  isLoading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Get branch ID based on user role
  const branchId = user?.role === 'branch-manager' ? Number(user.branchId) : undefined;

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedData = await fetchFunction();
        if (isMounted) {
          setData(fetchedData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Set up real-time subscription
    channel = subscribeFunction((payload: { new: T; old: T | null; eventType: string }) => {
      if (!isMounted) return;
      
      // Handle different event types
      switch (payload.eventType) {
        case 'INSERT':
          setData(prev => [...prev, payload.new]);
          break;
        case 'UPDATE':
          setData(prev => prev.map(item => 
            // @ts-ignore - We're assuming T has an id property
            item.id === payload.new.id ? payload.new : item
          ));
          break;
        case 'DELETE':
          if (payload.old) {
            setData(prev => prev.filter(item => 
              // @ts-ignore - We're assuming T has an id property
              item.id !== payload.old?.id
            ));
          }
          break;
      }
    }, branchId);

    return () => {
      isMounted = false;
      if (channel) {
        // Unsubscribe from channel to prevent memory leaks
        try {
          if (unsubscribe) {
            unsubscribe(channel);
          } else {
            channel.unsubscribe();
          }
        } catch (e) {
          console.error("Error unsubscribing from channel:", e);
        }
      }
    };
  }, [fetchFunction, subscribeFunction, branchId, ...dependencyArray]);

  return { data, isLoading, error };
}

// Specialized hook for low stock items
export function useLowStockItems(initialData: any[] = []) {
  const [lowStockItems, setLowStockItems] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Get branch ID based on user role
  const branchId = user?.role === 'branch-manager' ? Number(user.branchId) : undefined;

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { fetchLowStockItems, subscribeToLowStockItems } = await import('@/utils/supabaseApi');
        const fetchedData = await fetchLowStockItems(branchId);
        
        if (isMounted) {
          setLowStockItems(fetchedData);
        }
        
        // Subscribe to inventory changes to update low stock items
        channel = subscribeToLowStockItems((newItems) => {
          if (isMounted) {
            setLowStockItems(newItems);
          }
        }, branchId);
        
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred while fetching low stock items'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (channel) {
        try {
          if (unsubscribe) {
            unsubscribe(channel);
          } else {
            channel.unsubscribe();
          }
        } catch (e) {
          console.error("Error unsubscribing from channel:", e);
        }
      }
    };
  }, [branchId]);

  return { lowStockItems, isLoading, error };
}
