
import PageContainer from "@/components/layout/PageContainer";
import POSLayout from "@/components/pos/POSLayout";

const POS = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
      <POSLayout />
    </PageContainer>
  );
};

export default POS;
