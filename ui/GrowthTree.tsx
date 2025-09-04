import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface GrowthTreeProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streakCount: number;
}

export default function GrowthTree({ level, currentXP, nextLevelXP, streakCount }: GrowthTreeProps) {
  const { theme } = useTheme();
  const growthAnim = useRef(new Animated.Value(0)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate growth based on level
    Animated.timing(growthAnim, {
      toValue: Math.min(level / 7, 1), // Max growth at level 7
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animate leaves based on streak
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [level, streakCount]);

  const getTreeStage = () => {
    if (level <= 1) return 'seed';
    if (level <= 3) return 'sprout';
    if (level <= 5) return 'young';
    return 'mature';
  };

  const getTreeEmoji = () => {
    const stage = getTreeStage();
    switch (stage) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'young': return '🌳';
      case 'mature': return '🌲';
      default: return '🌱';
    }
  };

  const getTreeColor = () => {
    const stage = getTreeStage();
    switch (stage) {
      case 'seed': return '#8BC34A';
      case 'sprout': return '#4CAF50';
      case 'young': return '#2E7D32';
      case 'mature': return '#1B5E20';
      default: return '#8BC34A';
    }
  };

  const progressPercentage = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100;

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Growth Journey
          </Text>
          <Text style={[styles.level, { color: theme.secondaryAccent }]}>
            Level {level}
          </Text>
        </View>

        <View style={styles.treeContainer}>
          {/* Tree visualization */}
          <Animated.View
            style={[
              styles.tree,
              {
                transform: [
                  {
                    scale: growthAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.treeEmoji, { color: getTreeColor() }]}>
              {getTreeEmoji()}
            </Text>
          </Animated.View>

          {/* Floating leaves for streak effect */}
          {streakCount > 7 && (
            <Animated.View
              style={[
                styles.leaves,
                {
                  opacity: leafAnim,
                  transform: [
                    {
                      translateY: leafAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.leaf}>🍃</Text>
              <Text style={styles.leaf}>🍃</Text>
              <Text style={styles.leaf}>🍃</Text>
            </Animated.View>
          )}

          {/* Root system (shows with higher levels) */}
          {level > 3 && (
            <View style={styles.roots}>
              <View style={[styles.root, { backgroundColor: getTreeColor() + '40' }]} />
              <View style={[styles.root, { backgroundColor: getTreeColor() + '40' }]} />
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Progress to Level {level + 1}
          </Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressTrack, { backgroundColor: theme.textSecondary + '20' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.secondaryAccent,
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textPrimary }]}>
              {currentXP} / {nextLevelXP} XP
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.primaryAccent }]}>
              {streakCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Day Streak
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.secondaryAccent }]}>
              {getTreeStage()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Growth Stage
            </Text>
          </View>
        </View>

        {/* Motivational message based on growth stage */}
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {getTreeStage() === 'seed' && "Every journey begins with a single step 🌱"}
          {getTreeStage() === 'sprout' && "You're growing stronger each day! 🌿"}
          {getTreeStage() === 'young' && "Your consistency is paying off 🌳"}
          {getTreeStage() === 'mature' && "You've become a master of your habits! 🌲"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
  },
  level: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SF Pro Display Bold',
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative',
    marginBottom: 20,
  },
  tree: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeEmoji: {
    fontSize: 60,
  },
  leaves: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    gap: 10,
  },
  leaf: {
    fontSize: 16,
  },
  roots: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    gap: 8,
  },
  root: {
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
    minWidth: 80,
    textAlign: 'right',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'SF Pro Display Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'SF Pro Display Bold',
  },
});
