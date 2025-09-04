import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { EnhancedBadge } from '@/services/badges';
import EnhancedBadgeComponent from './EnhancedBadge';

interface BadgeShowcaseProps {
  badges: EnhancedBadge[];
  title: string;
  category?: string;
}

const { width } = Dimensions.get('window');

export default function BadgeShowcase({ badges, title, category }: BadgeShowcaseProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const unlockedBadges = badges.filter(badge => badge.isUnlocked);
  const lockedBadges = badges.filter(badge => !badge.isUnlocked);
  const totalBadges = badges.length;
  const progressPercentage = (unlockedBadges.length / totalBadges) * 100;

  const getCategoryColor = (): readonly [string, string] => {
    switch (category) {
      case 'streak': return ['#FF6B35', '#FFB347'] as const;
      case 'focus': return ['#32CD32', '#90EE90'] as const;
      case 'habit': return ['#9ACD32', '#ADFF2F'] as const;
      case 'special': return ['#8A2BE2', '#FF1493'] as const;
      case 'seasonal': return ['#FFD700', '#FF69B4'] as const;
      case 'hidden': return ['#4B0082', '#9370DB'] as const;
      default: return [theme.primaryAccent, theme.secondaryAccent] as const;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={getCategoryColor()}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {unlockedBadges.length}/{totalBadges} Unlocked
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {/* Show unlocked badges first */}
        {unlockedBadges.map((badge) => (
          <EnhancedBadgeComponent
            key={badge.id}
            badge={badge}
            size="medium"
            showDetails={true}
          />
        ))}
        
        {/* Then show locked badges */}
        {lockedBadges.map((badge) => (
          <EnhancedBadgeComponent
            key={badge.id}
            badge={badge}
            size="medium"
            showDetails={true}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerGradient: {
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  badgesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
