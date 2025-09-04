import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import * as Gamification from '@/services/gamification';
import { DailyTop3, Task } from '@/types';
import { AnimatedCard } from '@/ui/AnimatedCard';
import BadgeCard from '@/ui/BadgeCard';
import ChallengeCard from '@/ui/ChallengeCard';
import GrowthTree from '@/ui/GrowthTree';
import ProgressRing from '@/ui/ProgressRing';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];
  const todayTop3 = state.dailyTop3.find((d: DailyTop3) => d.date === today);
  const todayTasks = todayTop3 
    ? state.tasks.filter((task: Task) => todayTop3.taskIds.includes(task.id))
    : [];

  const todayHabits = state.habits.filter(habit => {
    const todayEntry = habit.history.find(entry => entry.date === today);
    return !todayEntry || !todayEntry.completed;
  });

  const completedHabitsToday = state.habits.filter(habit => {
    const todayEntry = habit.history.find(entry => entry.date === today);
    return todayEntry && todayEntry.completed;
  });

  // Gamification calculations
  const gamification = state.gamification;
  const currentLevel = gamification.currentLevel;
  const nextLevel = Gamification.LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressToNextLevel = nextLevel 
    ? ((gamification.totalXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  const habitCompletionRate = state.habits.length > 0 
    ? (completedHabitsToday.length / state.habits.length) * 100 
    : 0;

  const recentBadges = gamification.badges.filter(b => b.isUnlocked).slice(-3);
  const activeChallenge = gamification.challenges.find(c => !c.isCompleted);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleHabitToggle = async (habitId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const todayEntry = habit.history.find(entry => entry.date === today);
    const isCurrentlyCompleted = todayEntry && todayEntry.completed;

    // Toggle habit completion
    dispatch({
      type: 'TOGGLE_HABIT',
      payload: { habitId, date: today }
    });

    // Award XP and update gamification if completing (not uncompleting)
    if (!isCurrentlyCompleted) {
      // Award XP for habit completion
      dispatch({
        type: 'ADD_XP',
        payload: Gamification.XP_REWARDS.HABIT_COMPLETED
      });

      // Check for badge unlocks
      const newBadges = Gamification.checkBadgeUnlocks(
        state.gamification.badges,
        state.gamification.stats,
        state.gamification.streaks.current + 1
      );

      newBadges.forEach(badge => {
        dispatch({
          type: 'UNLOCK_BADGE',
          payload: badge.id
        });
      });

      // Update streak
      const newStreakCount = Gamification.updateStreak(
        state.gamification.streaks.current,
        state.gamification.streaks.lastActivityDate,
        state.gamification.streaks.longest
      );

      dispatch({
        type: 'UPDATE_STREAK',
        payload: newStreakCount
      });

      // Haptic feedback for completion
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleFocusSession = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/focus-session');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDailyQuote = () => {
    const quotes = [
      "Focus on being productive instead of busy.",
      "The way to get started is to quit talking and begin doing.",
      "Your limitation—it's only your imagination.",
      "Great things never come from comfort zones.",
      "Dream it. Wish it. Do it.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with Greeting and Daily Quote */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.greetingSection}>
              <Text style={[styles.greeting, { color: theme.textPrimary }]}>
                {getGreeting()}, Atharva 👋
              </Text>
              <Text style={[styles.dailyQuote, { color: theme.textSecondary }]}>
                "{getDailyQuote()}"
              </Text>
            </View>
            
            {/* Level and XP Display */}
            <View style={styles.levelSection}>
              <ProgressRing
                size={80}
                strokeWidth={6}
                progress={progressToNextLevel}
                color={theme.secondaryAccent}
              >
                <View style={styles.levelContent}>
                  <Text style={[styles.levelNumber, { color: theme.textPrimary }]}>
                    {currentLevel.level}
                  </Text>
                  <Text style={[styles.levelLabel, { color: theme.textSecondary }]}>
                    LVL
                  </Text>
                </View>
              </ProgressRing>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelTitle, { color: theme.textPrimary }]}>
                  {currentLevel.title}
                </Text>
                <Text style={[styles.xpText, { color: theme.textSecondary }]}>
                  {gamification.totalXP} XP
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Habit Checklist Card */}
          <AnimatedCard style={[styles.habitCard, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.isDark ? theme.tertiaryBackground : 'rgba(0, 0, 0, 0.05)',
            shadowColor: theme.isDark ? '#000000' : '#000000'
          }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Today's Habits
              </Text>
              <View style={styles.progressContainer}>
                <ProgressRing
                  size={40}
                  strokeWidth={4}
                  progress={habitCompletionRate}
                  color={theme.green}
                >
                  <Text style={[styles.progressPercentage, { color: theme.textPrimary }]}>
                    {Math.round(habitCompletionRate)}%
                  </Text>
                </ProgressRing>
              </View>
            </View>
            
            {state.habits.length === 0 ? (
              <TouchableOpacity 
                style={styles.emptyState}
                onPress={() => router.push('/(tabs)/habits')}
              >
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Add your first habit to get started
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.habitsList}>
                {state.habits.slice(0, 4).map((habit, index) => {
                  const todayEntry = habit.history.find(entry => entry.date === today);
                  const isCompleted = todayEntry && todayEntry.completed;
                  
                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={styles.habitItem}
                      onPress={() => handleHabitToggle(habit.id)}
                    >
                      <View style={[
                        styles.checkbox,
                        { 
                          backgroundColor: isCompleted ? theme.green : 'transparent',
                          borderColor: theme.textSecondary 
                        }
                      ]}>
                        {isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>
                          {habit.title}
                        </Text>
                        <Text style={[styles.habitGoal, { color: theme.textSecondary }]}>
                          {habit.microGoal}
                        </Text>
                      </View>
                      <View style={styles.streakBadge}>
                        <Text style={[styles.streakText, { color: theme.pink }]}>
                          {habit.streak}🔥
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </AnimatedCard>

          {/* Focus Timer Quick-Start Card */}
          <TouchableOpacity onPress={handleFocusSession}>
            <LinearGradient
              colors={[theme.blue, theme.teal] as const}
              style={[styles.focusCard, {
                shadowColor: theme.blue,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
              }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.focusContent}>
                <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                <View style={styles.focusText}>
                  <Text style={styles.focusTitle}>Start Focus Session</Text>
                  <Text style={styles.focusSubtitle}>Deep work awaits</Text>
                </View>
              </View>
              <View style={styles.focusStats}>
                <Text style={styles.focusStatsText}>
                  {state.focusSessions.length} sessions completed
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Summary Card */}
          <AnimatedCard style={[styles.summaryCard, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.isDark ? theme.tertiaryBackground : 'rgba(0, 0, 0, 0.05)',
            shadowColor: theme.isDark ? '#000000' : '#000000'
          }]}>
            <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
              Today's Progress
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.green }]}>
                  {completedHabitsToday.length}/{state.habits.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Habits Done
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.blue }]}>
                  {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Tasks Done
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.pink }]}>
                  {gamification.streaks.current}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Day Streak
                </Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <AnimatedCard style={[styles.badgesCard, { 
              backgroundColor: theme.cardBackground,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              shadowColor: theme.isDark ? '#000000' : '#000000'
            }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Recent Achievements
              </Text>
              <View style={styles.badgesRow}>
                {recentBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    size="small"
                  />
                ))}
              </View>
            </AnimatedCard>
          )}

          {/* Active Challenge */}
          {activeChallenge && (
            <ChallengeCard challenge={activeChallenge} />
          )}

          {/* Growth Tree */}
          <View style={styles.growthTreeContainer}>
            <GrowthTree
              level={currentLevel.level}
              currentXP={gamification.totalXP}
              nextLevelXP={nextLevel?.xpRequired || 0}
              streakCount={gamification.streaks.current}
            />
          </View>

          {/* Quick Actions */}
          <AnimatedCard style={[styles.quickActionsCard, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            shadowColor: theme.isDark ? '#000000' : '#000000'
          }]}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.primaryAccent} />
                <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                  Quick Capture
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/journal')}
              >
                <Ionicons name="pause-circle-outline" size={24} color={theme.secondaryAccent} />
                <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                  Decision Pause
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/daily-planning')}
              >
                <Ionicons name="list-outline" size={24} color={theme.primaryAccent} />
                <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                  Plan Day
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/analytics')}
              >
                <Ionicons name="analytics-outline" size={24} color={theme.secondaryAccent} />
                <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                  Analytics
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'SF Pro Display Bold',
  },
  // Header and Greeting Styles
  headerGradient: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 8,
  },
  dailyQuote: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
  },
  levelLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    opacity: 0.7,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  xpText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    opacity: 0.8,
  },
  // Card Styles
  habitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    opacity: 0.6,
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 2,
  },
  habitGoal: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    opacity: 0.6,
  },
  streakBadge: {
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  // Focus Card Styles
  focusCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  focusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusText: {
    marginLeft: 16,
    flex: 1,
  },
  focusTitle: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  focusSubtitle: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  focusStats: {
    alignItems: 'flex-end',
  },
  focusStatsText: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    opacity: 0.7,
  },
  // Badges Card Styles
  badgesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  // Quick Actions Card Styles
  quickActionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 0,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    width: '48%',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  growthTreeContainer: {
    marginBottom: 20,
  },
});
