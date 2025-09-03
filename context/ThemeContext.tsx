import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  background: string;
  primaryAccent: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  cardBackground: string;
  success: string;
  warning: string;
  isDark: boolean;
}

const lightTheme: Theme = {
  background: '#F9FAFB',
  primaryAccent: '#2563EB',
  secondaryAccent: '#F97316',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  cardBackground: '#FFFFFF',
  success: '#16A34A',
  warning: '#DC2626',
  isDark: false,
};

const darkTheme: Theme = {
  background: '#111827',
  primaryAccent: '#3B82F6',
  secondaryAccent: '#FB923C',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  cardBackground: '#1F2937',
  success: '#22C55E',
  warning: '#F87171',
  isDark: true,
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
