
/*
This script demonstrates how to enable real-time functionality for your tables in Supabase.
You don't need to run this directly in your application - it's for reference.
Run these SQL commands in your Supabase SQL Editor to enable real-time functionality:

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Set up replica identity for real-time updates
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL; 
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.attendance REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.branches REPLICA IDENTITY FULL;

-- Add tables to the publication used by the real-time system
BEGIN;
  -- Create the publication if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;

  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.branches;
COMMIT;
*/

// Import this file somewhere in your app to serve as documentation
// No need to export anything as it's just for documentation purposes
