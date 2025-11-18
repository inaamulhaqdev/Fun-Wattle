import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ----- Define the colours for each theme -----
const LightTheme = {
  background: "#ffffff",
  text: "#000000",
  card: "#f2f2f2",
  primary: "#fd9029",
};

const DarkTheme = {
  background: "#000000",
  text: "#ffffff",
  card: "#1a1a1a",
  primary: "#fd9029",
};

// ----- Context definition -----
const ThemeContext = createContext({
  theme: LightTheme,
  darkMode: false,
  toggleDarkMode: () => {},
});

// ----- Provider -----
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("darkMode");
      if (stored !== null) setDarkMode(stored === "true");
    })();
  }, []);

  const toggleDarkMode = async () => {
    await AsyncStorage.setItem("darkMode", (!darkMode).toString());
    setDarkMode((prev) => !prev);
  };

  const theme = darkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
