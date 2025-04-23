
import { useState, ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 px-4 py-6 lg:px-6 transition-all duration-300 ${
            !isMobile && sidebarOpen ? "ml-64" : !isMobile ? "lg:ml-64" : ""
          }`}
          onClick={() => {
            if (isMobile && sidebarOpen) setSidebarOpen(false);
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
