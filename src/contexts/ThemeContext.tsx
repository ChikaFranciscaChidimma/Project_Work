
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("branchsync-theme") as Theme;
      if (savedTheme) {
        return savedTheme;
      }
    }
    // Default to system
    return "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Function to apply theme
    const applyTheme = () => {
      // Remove previous theme classes
      root.classList.remove("light", "dark");

      let newTheme: "light" | "dark" = "light";

      // Determine the actual theme
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        newTheme = systemTheme;
      } else {
        newTheme = theme;
      }

      // Apply the theme class
      root.classList.add(newTheme);
      
      // Save to localStorage
      localStorage.setItem("branchsync-theme", theme);
    };
    
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
