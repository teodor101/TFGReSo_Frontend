import { createContext, useState, useEffect } from "react";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }
  // Verificar preferencia del sistema
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const initialState = {
  theme: getInitialTheme(),
};

export const ThemeContext = createContext(initialState);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    // Aplicar tema al documento
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

