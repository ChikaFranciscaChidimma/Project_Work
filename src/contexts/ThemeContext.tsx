
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  // Function to apply the theme to the document
  const applyTheme = (newTheme: "dark" | "light") => {
    const root = window.document.documentElement;
    const isDark = newTheme === "dark";
    
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(newTheme);
    setResolvedTheme(newTheme);
  };

  // Apply theme when the component mounts or theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const updateTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const finalTheme = theme === "system" ? systemTheme : theme;
      applyTheme(finalTheme);
    };

    updateTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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
