import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/ui/ToastContainer';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useState } from 'react';
import SplashScreen from './splash-screen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    'SF Pro Display Bold': require('../assets/fonts/SF-Pro-Display-Bold.otf'),
  });

  if (showSplash || !fontsLoaded) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <SplashScreen onFinish={() => setShowSplash(false)} />
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // Fonts are loaded; use fontFamily: 'SF Pro Display Bold' in styles where needed.

  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor: '#00000000' },
            }}
          />
          <ToastContainer />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
