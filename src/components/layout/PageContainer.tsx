
import { useState, ReactNode, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className="flex-1 px-4 py-6 lg:px-6 transition-all duration-300 overflow-x-hidden"
          style={{ 
            marginLeft: isMobile ? 0 : (sidebarOpen ? '16rem' : '0'),
            width: isMobile ? '100%' : 'auto'
          }}
          onClick={() => {
            if (sidebarOpen && isMobile) setSidebarOpen(false);
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
