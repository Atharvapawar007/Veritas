import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  cardBackground: string;
  // Accent colors
  blue: string;
  green: string;
  pink: string;
  orange: string;
  purple: string;
  red: string;
  teal: string;
  // Legacy support
  primaryAccent: string;
  secondaryAccent: string;
  success: string;
  warning: string;
  isDark: boolean;
  // Gradient colors for enhanced UI
  gradientStart: string;
  gradientEnd: string;
  cardGradientStart: string;
  cardGradientEnd: string;
}

const lightTheme: Theme = {
  background: '#F8F9FA',
  secondaryBackground: '#FFFFFF',
  tertiaryBackground: '#F2F2F7',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textDisabled: '#C7C7CC',
  cardBackground: '#FFFFFF',
  // Accent colors (lighter versions for light mode)
  blue: '#007AFF',
  green: '#34C759',
  pink: '#FF2D92',
  orange: '#FF9500',
  purple: '#AF52DE',
  red: '#FF3B30',
  teal: '#5AC8FA',
  // Legacy support
  primaryAccent: '#007AFF',
  secondaryAccent: '#34C759',
  success: '#34C759',
  warning: '#FF9500',
  isDark: false,
  gradientStart: '#F8F9FA',
  gradientEnd: '#ECF0F1',
  cardGradientStart: '#FFFFFF',
  cardGradientEnd: '#F8F9FA',
};

const darkTheme: Theme = {
  // New dark mode palette
  background: '#0D0D0D',
  secondaryBackground: '#1C1C1E',
  tertiaryBackground: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A9A9AA',
  textDisabled: '#6C6C70',
  cardBackground: '#1C1C1E',
  // Accent colors
  blue: '#0A84FF',
  green: '#30D158',
  pink: '#FF2D55',
  orange: '#FF9500',
  purple: '#BF5AF2',
  red: '#FF453A',
  teal: '#64D2FF',
  // Legacy support (map to new colors)
  primaryAccent: '#0A84FF',
  secondaryAccent: '#30D158',
  success: '#30D158',
  warning: '#FF9500',
  isDark: true,
  gradientStart: '#0D0D0D',
  gradientEnd: '#1C1C1E',
  cardGradientStart: '#1C1C1E',
  cardGradientEnd: '#2C2C2E',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
