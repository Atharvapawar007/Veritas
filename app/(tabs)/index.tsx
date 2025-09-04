import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import * as Gamification from '@/services/gamification';
import GrowthTree from '@/ui/GrowthTree';

export default function HomeScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDailyQuote = () => {
    const quotes = [
      "Great things never come from comfort zones.",
      "The way to get started is to quit talking and begin doing.",
      "Don't let yesterday take up too much of today.",
      "You learn more from failure than from success.",
      "It's not whether you get knocked down, it's whether you get up.",
      "If you are working on something exciting that you really care about, you don't have to be pushed.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts."
    ];
    const todayIndex = new Date().getDate();
    return quotes[todayIndex % quotes.length];
  };

  const handleFocusSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/focus-session');
  };

  const toggleHabit = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const existingEntry = habit.history.find(entry => entry.date === today);
    
    if (existingEntry) {
      const updatedHabit = {
        ...habit,
        history: habit.history.map(entry =>
          entry.date === today 
            ? { ...entry, completed: !entry.completed }
            : entry
        )
      };
      
      if (!existingEntry.completed) {
        updatedHabit.streak = habit.streak + 1;
      } else {
        updatedHabit.streak = Math.max(0, habit.streak - 1);
      }
      
      const updatedHabits = state.habits.map(h => 
        h.id === habitId ? updatedHabit : h
      );
      dispatch({ type: 'SET_HABITS', payload: updatedHabits });
    } else {
      const updatedHabit = {
        ...habit,
        history: [...habit.history, { date: today, completed: true }],
        streak: habit.streak + 1
      };
      
      const updatedHabits = state.habits.map(h => 
        h.id === habitId ? updatedHabit : h
      );
      dispatch({ type: 'SET_HABITS', payload: updatedHabits });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getHabitStatus = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return false;
    
    const todayEntry = habit.history.find(entry => entry.date === today);
    return todayEntry?.completed || false;
  };

  const getTodayStats = () => {
    const completedHabits = state.habits.filter(habit => {
      const todayEntry = habit.history.find(entry => entry.date === today);
      return todayEntry?.completed;
    }).length;
    
    const todayFocusSessions = state.focusSessions.filter(session => {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
      return sessionDate === today;
    }).length;
    
    const completedTasks = state.tasks.filter(task => 
      task.status === 'completed' && task.completedAt && 
      new Date(task.completedAt).toISOString().split('T')[0] === today
    ).length;

    return {
      habits: completedHabits,
      focus: todayFocusSessions,
      tasks: completedTasks
    };
  };

  const stats = getTodayStats();
  const currentLevel = Gamification.calculateLevel(state.gamification?.totalXP || 0);
  const { currentLevelXP, nextLevelXP } = Gamification.getXPForLevel(currentLevel);
  const xpTotal = state.gamification?.totalXP || 0;
  const levelSpan = nextLevelXP - currentLevelXP;
  const progressToNext = levelSpan > 0 ? (xpTotal - currentLevelXP) / levelSpan : 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with Greeting and Level */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={[
              styles.card, 
              { 
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.greetingSection}>
                <Text style={[styles.greeting, { color: theme.textPrimary }]}>
                  {getGreeting()}, Atharva 👋
                </Text>
                <Text style={[styles.dailyQuote, { color: theme.textSecondary }]}>
                  "{getDailyQuote()}"
                </Text>
              </View>
              
              <View style={styles.levelSection}>
                <View style={[styles.levelCircle, { borderColor: theme.success }]}>
                  <Text style={[styles.levelNumber, { color: theme.success }]}>{currentLevel.level}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color: theme.textPrimary }]}>Level {currentLevel.level}</Text>
                  <Text style={[styles.xpText, { color: theme.success }]}>
                    {state.gamification?.totalXP || 0} XP
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { backgroundColor: theme.success, width: `${Math.min(progressToNext * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                Progress to Level {currentLevel.level + 1}
              </Text>
            </View>
          </LinearGradient>

          {/* Today's Progress Card */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={[
              styles.card, 
              { 
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Today's Progress
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.success }]}>
                  {stats.habits}/{state.habits.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Habits
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.blue }]}>
                  {stats.focus}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Focus
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.warning }]}>
                  {stats.tasks}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Tasks
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Habit Checklist Card */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={[
              styles.card, 
              { 
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Today's Habits
              </Text>
              <View style={[
                styles.progressBadge, 
                { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
              ]}>
                <Text style={[styles.progressBadgeText, { color: theme.textSecondary }]}>
                  {Math.round((stats.habits / Math.max(state.habits.length, 1)) * 100)}%
                </Text>
              </View>
            </View>
            
            {state.habits.length === 0 ? (
              <TouchableOpacity 
                style={[
                  styles.emptyButton, 
                  { 
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}
                onPress={() => router.push('/(tabs)/habits')}
              >
                <Text style={[styles.emptyButtonText, { color: theme.textSecondary }]}>
                  Add your first habit to get started
                </Text>
                <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.habitsList}>
                {state.habits.slice(0, 3).map((habit) => {
                  const isCompleted = getHabitStatus(habit.id);
                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={[
                        styles.habitItem, 
                        { 
                          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }
                      ]}
                      onPress={() => toggleHabit(habit.id)}
                    >
                      <Ionicons 
                        name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                        size={24} 
                        color={isCompleted ? theme.success : theme.textSecondary} 
                      />
                      <Text style={[
                        styles.habitText, 
                        { 
                          color: isCompleted ? theme.textSecondary : theme.textPrimary,
                          textDecorationLine: isCompleted ? 'line-through' : 'none'
                        }
                      ]}>
                        {habit.title}
                      </Text>
                      {habit.streak > 0 && (
                        <Text style={[styles.streakText, { color: theme.warning }]}>
                          🔥 {habit.streak}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </LinearGradient>

          {/* Focus Session Card */}
          <TouchableOpacity onPress={handleFocusSession}>
            <LinearGradient
              colors={[theme.blue, theme.teal] as const}
              style={[
                styles.focusCard,
                {
                  shadowColor: theme.blue,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 12
                }
              ]}
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

          {/* Growth Tree */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={[
              styles.card,
              {
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <GrowthTree
              level={currentLevel.level}
              currentXP={state.gamification?.totalXP || 0}
              nextLevelXP={nextLevelXP}
              streakCount={Math.max(...state.habits.map(h => h.streak), 0)}
            />
          </LinearGradient>

          {/* Quick Actions */}
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={[
              styles.card, 
              { 
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
                marginBottom: 0
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={[
                  styles.quickAction, 
                  { 
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    shadowColor: theme.isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5
                  }
                ]}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <LinearGradient
                  colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add-circle-outline" size={24} color={theme.primaryAccent} />
                  <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                    Quick Capture
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.quickAction, 
                  { 
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    shadowColor: theme.isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5
                  }
                ]}
                onPress={() => router.push('/journal')}
              >
                <LinearGradient
                  colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="pause-circle-outline" size={24} color={theme.secondaryAccent} />
                  <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                    Decision Pause
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.quickAction, 
                  { 
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    shadowColor: theme.isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5
                  }
                ]}
                onPress={() => router.push('/daily-planning')}
              >
                <LinearGradient
                  colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="list-outline" size={24} color={theme.primaryAccent} />
                  <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                    Plan Day
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.quickAction, 
                  { 
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    shadowColor: theme.isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5
                  }
                ]}
                onPress={() => router.push('/(tabs)/analytics')}
              >
                <LinearGradient
                  colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="analytics-outline" size={24} color={theme.secondaryAccent} />
                  <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>
                    Analytics
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
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
    lineHeight: 22,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
  },
  levelInfo: {
    alignItems: 'flex-start',
  },
  levelTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  xpText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressBadgeText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  habitText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  streakText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  focusCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  focusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  focusText: {
    flex: 1,
  },
  focusTitle: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  focusSubtitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  focusStats: {
    alignItems: 'center',
  },
  focusStatsText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  growthTreeContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
  },
});
