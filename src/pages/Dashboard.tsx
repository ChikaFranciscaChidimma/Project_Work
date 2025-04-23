
import PageContainer from "@/components/layout/PageContainer";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardLayout />
    </PageContainer>
  );
};

export default Dashboard;
