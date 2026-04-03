import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Apply theme immediately before React renders (avoids flash)
function getInitialTheme() {
  try {
    const stored = localStorage.getItem("bitepass-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark"; // default to dark
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    try {
      localStorage.setItem("bitepass-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
