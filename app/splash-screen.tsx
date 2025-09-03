import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { theme } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 4 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Use a fixed dark gradient so the splash looks identical in both modes
  const gradientColors = ['#0B1220', '#0F172A', '#1E293B'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.title, { 
          color: 'rgb(255, 255, 255)',
          textShadowColor: 'rgba(255, 255, 255, 0.85)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }]}>Veritas</Text>
        <Text style={[styles.subtitle, { 
          color: 'rgb(226, 232, 240)',
          textShadowColor: 'rgba(255, 255, 255, 255)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }]}>Depth over distraction</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Cheltenham',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 1.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
