import { createContext, useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  // Toggle function
  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--background", theme.background);
    document.documentElement.style.setProperty("--card", theme.card);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};