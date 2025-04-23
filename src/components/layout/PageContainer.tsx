
import { useState, ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className="flex-1 px-4 py-6 lg:px-6 lg:ml-64 transition-all duration-300"
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false);
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
