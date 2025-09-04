import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { EnhancedBadge } from '@/services/badges';
import * as Haptics from 'expo-haptics';

interface EnhancedBadgeProps {
  badge: EnhancedBadge;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onPress?: () => void;
}

export default function EnhancedBadgeComponent({ 
  badge, 
  size = 'medium', 
  showDetails = false,
  onPress 
}: EnhancedBadgeProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const unlockAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: { container: 60, icon: 24, title: 12, description: 10 },
    medium: { container: 80, icon: 32, title: 14, description: 12 },
    large: { container: 120, icon: 48, title: 18, description: 14 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (badge.isUnlocked) {
      // Glow animation for unlocked badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [badge.isUnlocked]);

  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Press animation
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

  const getBorderColor = () => {
    if (!badge.isUnlocked) return theme.textSecondary + '40';
    
    switch (badge.tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'diamond': return '#B9F2FF';
      default: return badge.visualDesign.borderColor;
    }
  };

  const getGradientColors = (): [string, string] => {
    if (!badge.isUnlocked) {
      return [theme.textSecondary + '20', theme.textSecondary + '10'] as [string, string];
    }
    return badge.visualDesign.gradient;
  };

  const renderBadgeShape = () => {
    const shapeStyle = {
      width: config.container,
      height: config.container,
      borderRadius: badge.visualDesign.shape === 'circle' ? config.container / 2 : 
                   badge.visualDesign.shape === 'diamond' ? 8 :
                   badge.visualDesign.shape === 'hexagon' ? 16 : 20,
      borderWidth: 3,
      borderColor: getBorderColor(),
    };

    return (
      <Animated.View
        style={[
          shapeStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: badge.isUnlocked ? 1 : 0.6,
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: shapeStyle.borderRadius,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow effect for unlocked badges */}
          {badge.isUnlocked && (
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: shapeStyle.borderRadius,
                  backgroundColor: badge.visualDesign.glowColor,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                },
              ]}
            />
          )}
          
          {/* Badge Icon */}
          <Text style={[styles.badgeIcon, { fontSize: config.icon }]}>
            {badge.isUnlocked ? badge.visualDesign.iconSymbol : '🔒'}
          </Text>
          
          {/* Tier indicator */}
          {badge.isUnlocked && badge.tier !== 'bronze' && (
            <View style={[styles.tierIndicator, { backgroundColor: getBorderColor() }]}>
              <Text style={styles.tierText}>
                {badge.tier.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Rarity sparkles */}
          {badge.isUnlocked && (badge.rarity === 'epic' || badge.rarity === 'legendary') && (
            <View style={styles.rarityIndicator}>
              <Text style={styles.sparkle}>✨</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.badgeContainer}>
        {renderBadgeShape()}
        
        {/* Badge shadow */}
        {badge.isUnlocked && (
          <View
            style={[
              styles.shadow,
              {
                width: config.container,
                height: config.container,
                borderRadius: config.container / 2,
                backgroundColor: badge.visualDesign.shadowIntensity > 0.5 ? 
                  badge.visualDesign.glowColor + '30' : 'transparent',
              },
            ]}
          />
        )}
      </View>
      
      {/* Badge Details */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text 
            style={[
              styles.badgeTitle, 
              { 
                fontSize: config.title,
                color: badge.isUnlocked ? theme.textPrimary : theme.textSecondary 
              }
            ]}
            numberOfLines={1}
          >
            {badge.name}
          </Text>
          <Text 
            style={[
              styles.badgeDescription, 
              { 
                fontSize: config.description,
                color: theme.textSecondary 
              }
            ]}
            numberOfLines={2}
          >
            {badge.isUnlocked ? badge.description : 'Locked'}
          </Text>
          
          {/* Power-up indicator */}
          {badge.isUnlocked && badge.powerUp && (
            <View style={styles.powerUpIndicator}>
              <Text style={styles.powerUpText}>⚡ Power-up</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  badgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    top: 4,
    zIndex: -1,
    opacity: 0.3,
  },
  badgeIcon: {
    textAlign: 'center',
  },
  tierIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierText: {
    fontSize: 10,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
  },
  rarityIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
  },
  sparkle: {
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  badgeTitle: {
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDescription: {
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
  powerUpIndicator: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  powerUpText: {
    fontSize: 10,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
  },
});
