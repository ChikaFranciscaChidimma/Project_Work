
import { supabase } from "@/integrations/supabase/client";

// Analytics functions
export const fetchSalesByBranch = async (): Promise<{branch_id: number, branch_name: string, total_sales: number}[]> => {
  const { data: branchesData } = await supabase
    .from('branches')
    .select('branch_id, branch_name');
  
  const { data: ordersData } = await supabase
    .from('orders')
    .select('branch_id, total_amount');

  // Process the data to get sales by branch
  const salesByBranch = branchesData?.map(branch => {
    const branchOrders = ordersData?.filter(order => order.branch_id === branch.branch_id) || [];
    const totalSales = branchOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      total_sales: totalSales
    };
  }) || [];
  
  return salesByBranch;
};
