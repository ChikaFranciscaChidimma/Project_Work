
import { useState, ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SalesAssistant from "../chatbot/SalesAssistant";

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
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 px-4 py-6 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false);
          }}
        >
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <SalesAssistant />
      </div>
    </div>
  );
};

export default PageContainer;
