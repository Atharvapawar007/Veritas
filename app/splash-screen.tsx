import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { theme } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const titleSlideAnim = useRef(new Animated.Value(-50)).current;
  const subtitleSlideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-width)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const orb3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero entrance: fade in, scale up, slight ease for premium feel
    const heroIn = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]);

    // Text reveal
    const textReveal = Animated.stagger(160, [
      Animated.spring(titleSlideAnim, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleSlideAnim, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
    ]);

    // Subtle micro-tilt
    const tilt = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });

    // Background shimmer
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: width,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Logo glow breathing
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Floating orbs drift
    const orbDrift = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 4000,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    Animated.sequence([heroIn, textReveal, tilt]).start();
    shimmerLoop.start();
    glowLoop.start();
    orbDrift(orb1, 0).start();
    orbDrift(orb2, 400).start();
    orbDrift(orb3, 800).start();

    // Exit
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(onFinish);
    }, 3600);

    return () => {
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, titleSlideAnim, subtitleSlideAnim, rotateAnim, shimmerAnim, logoGlow, orb1, orb2, orb3, onFinish]);

  // Enhanced gradient with more depth - consistent across all themes
  const gradientColors = ['#0B1220', '#1E293B', '#334155', '#0F172A'] as const;
  
  // Rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const glowScale = logoGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOpacity = logoGlow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.3, 0.7, 1]}
    >
      {/* Background shimmer effect */}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX: shimmerAnim }],
          },
        ]}
      />
      
      {/* Background gradient orbs */}
      <Animated.View
        style={[styles.orb, {
          backgroundColor: theme.blue + '33',
          width: 220, height: 220, borderRadius: 110,
          top: height * 0.15, left: -60,
          transform: [
            { translateY: orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
            { translateX: orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) },
          ],
        }]}
      />
      <Animated.View
        style={[styles.orb, {
          backgroundColor: theme.teal + '33',
          width: 180, height: 180, borderRadius: 90,
          bottom: height * 0.18, right: -40,
          transform: [
            { translateY: orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) },
            { translateX: orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
          ],
        }]}
      />
      <Animated.View
        style={[styles.orb, {
          backgroundColor: theme.pink + '29',
          width: 140, height: 140, borderRadius: 70,
          bottom: height * 0.08, left: width * 0.25,
          transform: [
            { translateY: orb3.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
            { translateX: orb3.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
          ],
        }]}
      />

      {/* Main content with enhanced animations */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        {/* Logo with soft glow */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoGlow,
              {
                backgroundColor: theme.secondaryAccent + '55',
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </View>
        {/* Title with slide animation */}
        <Animated.View
          style={{
            transform: [{ translateY: titleSlideAnim }],
          }}
        >
          <Text style={styles.title}>Veritas</Text>
        </Animated.View>
        
        {/* Subtitle with slide animation */}
        <Animated.View
          style={{
            transform: [{ translateY: subtitleSlideAnim }],
          }}
        >
          <Text style={styles.subtitle}>Depth over distraction</Text>
        </Animated.View>
        
        {/* Animated accent line */}
        <Animated.View
          style={[
            styles.accentLine,
            {
              opacity: fadeAnim,
              transform: [{ scaleX: scaleAnim }],
            },
          ]}
        />
      </Animated.View>
      
      {/* Floating particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${15 + index * 12}%`,
                top: `${20 + (index % 3) * 25}%`,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: Animated.multiply(
                      pulseAnim,
                      new Animated.Value(Math.sin(index) * 10)
                    ),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
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
    zIndex: 2,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 1.5,
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'rgba(226, 232, 240, 0.9)',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    marginBottom: 30,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    width: 100,
    transform: [{ skewX: '-20deg' }],
    zIndex: 1,
  },
  accentLine: {
    width: 80,
    height: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 2,
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  orb: {
    position: 'absolute',
    opacity: 0.8,
  },
  logoContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logo: {
    width: 96,
    height: 96,
  },
});
