
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "./Header";
import SalesAssistant from "../chatbot/SalesAssistant";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-background ${resolvedTheme}`}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          <div className="fade-in">
            {children}
          </div>
        </div>
      </main>
      <div className="fixed bottom-4 right-4 z-40">
        <SalesAssistant />
      </div>
    </div>
  );
};

export default PageContainer;
