// src/context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  card: '#F5F5F5',
  accent: '#0f0', // verde neon ainda pode aparecer como detalhe
};

export const darkTheme = {
  background: '#1C1C1C',
  text: '#FFFFFF',
  card: '#2C2C2C',
  accent: '#39FF14', // verde neon mottu
};

export const ThemeProvider = ({ children }) => {
  // pega tema inicial do sistema
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
