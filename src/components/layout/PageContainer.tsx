
import { useState, ReactNode, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SalesAssistant from "../chatbot/SalesAssistant";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // Close sidebar when screen gets smaller
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${resolvedTheme === 'dark' ? 'dark' : 'light'}`}>
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 px-4 py-6 transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
          onClick={() => {
            if (sidebarOpen && window.innerWidth < 1024) setSidebarOpen(false);
          }}
        >
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <div className="fixed bottom-4 right-4 z-40">
          <SalesAssistant />
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
