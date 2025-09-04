import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showUnlockAnimation?: boolean;
}

export default function BadgeCard({ 
  badge, 
  onPress, 
  size = 'medium',
  showUnlockAnimation = false 
}: BadgeCardProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(badge.isUnlocked ? 1 : 0.4)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: { container: 60, icon: 24, title: 10 },
    medium: { container: 80, icon: 32, title: 12 },
    large: { container: 100, icon: 40, title: 14 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (showUnlockAnimation && badge.isUnlocked) {
      // Unlock animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [badge.isUnlocked, showUnlockAnimation]);

  const handlePress = () => {
    if (onPress) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    }
  };

  const gradientColors = badge.isUnlocked 
    ? [theme.secondaryAccent, theme.primaryAccent] as const
    : [theme.textSecondary + '40', theme.textSecondary + '20'] as const;

  return (
    <TouchableOpacity onPress={handlePress} disabled={!onPress}>
      <Animated.View
        style={[
          styles.container,
          {
            width: config.container,
            height: config.container,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradient, { borderRadius: config.container / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.icon, { fontSize: config.icon }]}>
            {badge.icon}
          </Text>
        </LinearGradient>
        
        {/* Glow effect for unlock animation */}
        <Animated.View
          style={[
            styles.glow,
            {
              width: config.container + 20,
              height: config.container + 20,
              borderRadius: (config.container + 20) / 2,
              opacity: glowAnim,
            },
          ]}
        />
        
        {size !== 'small' && (
          <Text
            style={[
              styles.title,
              {
                fontSize: config.title,
                color: badge.isUnlocked ? theme.textPrimary : theme.textSecondary,
              },
            ]}
            numberOfLines={2}
          >
            {badge.name}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    fontFamily: 'SF Pro Display Bold',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    opacity: 0,
    top: -10,
    left: -10,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'SF Pro Display Bold',
    fontWeight: '600',
  },
});
