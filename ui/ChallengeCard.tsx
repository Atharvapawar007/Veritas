import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Challenge } from '@/types';
import ProgressRing from './ProgressRing';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete?: () => void;
}

export default function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const { theme } = useTheme();
  const completionAnim = useRef(new Animated.Value(0)).current;
  const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);

  useEffect(() => {
    if (challenge.isCompleted && onComplete) {
      // Completion animation
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(onComplete, 1000);
      });
    }
  }, [challenge.isCompleted]);

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const getChallengeIcon = () => {
    switch (challenge.type) {
      case 'weekly':
        return 'calendar-outline';
      case 'monthly':
        return 'calendar';
      default:
        return 'trophy-outline';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              scale: completionAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.05, 1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={challenge.isCompleted 
          ? [theme.success + '20', theme.success + '10']
          : [theme.cardGradientStart, theme.cardGradientEnd]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getChallengeIcon()} 
                size={20} 
                color={challenge.isCompleted ? theme.success : theme.primaryAccent} 
              />
            </View>
            <View style={styles.titleText}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {challenge.title}
              </Text>
              <Text style={[styles.timeRemaining, { color: theme.textSecondary }]}>
                {getTimeRemaining()}
              </Text>
            </View>
          </View>
          
          <ProgressRing
            size={50}
            strokeWidth={4}
            progress={progressPercentage}
            color={challenge.isCompleted ? theme.success : theme.secondaryAccent}
          >
            <Text style={[styles.progressText, { color: theme.textPrimary }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </ProgressRing>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {challenge.description}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              Progress
            </Text>
            <Text style={[styles.progressNumbers, { color: theme.textPrimary }]}>
              {challenge.progress} / {challenge.target}
            </Text>
          </View>
          
          <View style={styles.rewardSection}>
            <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>
              Reward
            </Text>
            <View style={styles.rewardInfo}>
              <Text style={[styles.xpReward, { color: theme.secondaryAccent }]}>
                +{challenge.reward.xp} XP
              </Text>
              {challenge.reward.badge && (
                <Text style={[styles.badgeReward, { color: theme.primaryAccent }]}>
                  🏆 Badge
                </Text>
              )}
            </View>
          </View>
        </View>

        {challenge.isCompleted && (
          <Animated.View
            style={[
              styles.completedOverlay,
              {
                opacity: completionAnim,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={40} color={theme.success} />
            <Text style={[styles.completedText, { color: theme.success }]}>
              Challenge Complete!
            </Text>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 24,
    borderRadius: 20,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 2,
  },
  timeRemaining: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  progressNumbers: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'SF Pro Display Bold',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
  },
  rewardSection: {
    alignItems: 'flex-end',
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  rewardInfo: {
    alignItems: 'flex-end',
  },
  xpReward: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
  },
  badgeReward: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 2,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
    marginTop: 8,
  },
});
