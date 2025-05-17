
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "./types";

// API functions for Branches
export const fetchBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from('branches')
    .select('*');
  
  if (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
  
  return data as Branch[];
};
