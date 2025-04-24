
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
    <div className={`min-h-screen bg-background flex flex-col ${resolvedTheme}`}>
      <Header />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <div className="fixed bottom-4 right-4 z-40">
        <SalesAssistant />
      </div>
    </div>
  );
};

export default PageContainer;
