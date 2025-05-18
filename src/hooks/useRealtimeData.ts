
import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { unsubscribe, debounce } from '@/utils/api/utils';

// Queue for batching updates to prevent too many re-renders
type UpdateQueue<T> = {
  inserts: T[];
  updates: Map<string | number, T>;
  deletes: Set<string | number>;
};

export function useRealtimeData<T extends { [key: string]: any }>(
  initialData: T[],
  fetchFunction: () => Promise<T[]>,
  subscribeFunction: (callback: any, branchId?: number) => RealtimeChannel,
  dependencyArray: any[] = [],
  idField: keyof T = 'id' // Default ID field
): {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Get branch ID based on user role
  const branchId = user?.role === 'branch-manager' ? Number(user.branchId) : undefined;

  // Create a refetch function that can be called manually
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data for ${subscribeFunction.name || 'unknown function'}`);
      const fetchedData = await fetchFunction();
      console.log(`Fetched ${fetchedData?.length || 0} items`);
      setData(fetchedData);
    } catch (err) {
      console.error(`Error in refetch for ${subscribeFunction.name || 'unknown function'}:`, err);
      setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel;
    
    // Create update queue for batching
    const updateQueue: UpdateQueue<T> = {
      inserts: [],
      updates: new Map(),
      deletes: new Set()
    };

    // Process batch updates (debounced to avoid excessive re-renders)
    const processQueuedUpdates = () => {
      if (!isMounted) return;

      // Apply all batched updates at once
      setData(currentData => {
        let newData = [...currentData];
        
        // Process deletions
        if (updateQueue.deletes.size > 0) {
          newData = newData.filter(item => !updateQueue.deletes.has(item[idField]));
        }
        
        // Process updates
        if (updateQueue.updates.size > 0) {
          newData = newData.map(item => 
            updateQueue.updates.has(item[idField]) 
              ? updateQueue.updates.get(item[idField]) as T 
              : item
          );
        }
        
        // Process inserts
        if (updateQueue.inserts.length > 0) {
          newData = [...newData, ...updateQueue.inserts];
        }
        
        // Reset the queue
        updateQueue.inserts = [];
        updateQueue.updates = new Map();
        updateQueue.deletes = new Set();
        
        return newData;
      });
    };
    
    // Debounce updates to limit re-renders (process every 300ms)
    const batchedUpdate = debounce(processQueuedUpdates, 300);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const functionName = subscribeFunction.name || 'unknown';
        console.log(`Initial data fetch for ${functionName} started`);
        
        const fetchedData = await fetchFunction();
        
        if (isMounted) {
          console.log(`Initial data fetch for ${functionName} completed:`, 
            fetchedData?.length || 0, 'items');
          setData(fetchedData);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching data:", err);
          setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Set up real-time subscription with batched updates
    try {
      channel = subscribeFunction((payload: { new: T; old: T | null; eventType: string }) => {
        if (!isMounted) return;
        
        console.log(`Realtime ${payload.eventType} event received:`, payload);
        
        // Queue updates based on event type
        switch (payload.eventType) {
          case 'INSERT':
            updateQueue.inserts.push(payload.new);
            break;
          case 'UPDATE':
            updateQueue.updates.set(payload.new[idField], payload.new);
            break;
          case 'DELETE':
            if (payload.old) {
              updateQueue.deletes.add(payload.old[idField]);
            }
            break;
        }
        
        // Process updates in batches
        batchedUpdate();
      }, branchId);
    } catch (err) {
      console.error("Error setting up subscription:", err);
      if (isMounted) {
        setError(err instanceof Error ? err : new Error('Error setting up real-time subscription'));
      }
    }

    return () => {
      console.log("Cleaning up subscription");
      isMounted = false;
      if (channel) {
        try {
          unsubscribe(channel);
        } catch (e) {
          console.error("Error unsubscribing from channel:", e);
        }
      }
    };
  }, [fetchFunction, subscribeFunction, branchId, idField, ...dependencyArray]);

  return { data, isLoading, error, refetch };
}

// Specialized hook for low stock items with more efficient updates
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
        console.log("Fetching low stock items");
        const { fetchLowStockItems, subscribeToLowStockItems } = await import('@/utils/supabaseApi');
        const fetchedData = await fetchLowStockItems(branchId);
        
        if (isMounted) {
          console.log(`Fetched ${fetchedData?.length || 0} low stock items`);
          setLowStockItems(fetchedData);
        }
        
        // Subscribe to inventory changes with debouncing
        const updateLowStockItems = debounce(async () => {
          if (!isMounted) return;
          
          try {
            console.log("Updating low stock items due to inventory changes");
            const newItems = await fetchLowStockItems(branchId);
            setLowStockItems(newItems);
          } catch (err) {
            console.error("Error updating low stock items:", err);
          }
        }, 500);
        
        // Subscribe with debounced updates
        channel = subscribeToLowStockItems(() => {
          updateLowStockItems();
        }, branchId);
        
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching low stock items:", err);
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
      console.log("Cleaning up low stock items subscription");
      isMounted = false;
      if (channel) {
        try {
          unsubscribe(channel);
        } catch (e) {
          console.error("Error unsubscribing from channel:", e);
        }
      }
    };
  }, [branchId]);

  return { lowStockItems, isLoading, error };
}
