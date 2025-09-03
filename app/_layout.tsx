import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import SplashScreen from './splash-screen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    'SF-Pro-Display-Regular': require('../assets/fonts/SF-Pro-Display-Regular.otf'),
    'SF-Pro-Display-Bold': require('../assets/fonts/SF-Pro-Display-Bold.otf'),
  });

  if (showSplash || !fontsLoaded) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  // Fonts are loaded; use fontFamily: 'SF-Pro-Display-Regular' or 'SF-Pro-Display-Bold' in styles where needed.

  return (
    <ThemeProvider>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
}
