import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { AnimatedCard } from '@/ui/AnimatedCard';
import { fontStyles } from '@/ui/fonts';

export default function AnalyticsScreen() {
  const { state } = useAppContext();
  const { theme } = useTheme();

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Focus sessions this week
    const weekSessions = state.focusSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const totalFocusMinutes = weekSessions.reduce((sum, session) => sum + session.actualDuration, 0);
    const focusSessionsCompleted = weekSessions.length;

    // Habit success rate this week
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    let totalHabitOpportunities = 0;
    let completedHabitDays = 0;

    state.habits.forEach(habit => {
      weekDates.forEach(date => {
        const habitEntry = habit.history.find(entry => entry.date === date);
        totalHabitOpportunities++;
        if (habitEntry && habitEntry.completed) {
          completedHabitDays++;
        }
      });
    });

    const habitSuccessPercentage = totalHabitOpportunities > 0 
      ? Math.round((completedHabitDays / totalHabitOpportunities) * 100)
      : 0;

    // Longest streak
    const longestStreak = state.habits.reduce((max, habit) => 
      Math.max(max, habit.streak), 0
    );

    return {
      totalFocusMinutes,
      focusSessionsCompleted,
      habitSuccessPercentage,
      longestStreak,
      weekStartDate: weekStart.toISOString().split('T')[0],
    };
  };

  const stats = getWeeklyStats();

  // Get daily breakdown for the week
  const getDailyBreakdown = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Focus minutes for this day
      const dayFocusMinutes = state.focusSessions
        .filter(session => {
          const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
          return sessionDate === dateStr;
        })
        .reduce((sum, session) => sum + session.actualDuration, 0);

      // Habits completed for this day
      const habitsCompleted = state.habits.filter(habit => {
        const entry = habit.history.find(h => h.date === dateStr);
        return entry && entry.completed;
      }).length;

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        focusMinutes: dayFocusMinutes,
        habitsCompleted,
        totalHabits: state.habits.length,
      });
    }
    
    return days;
  };

  const dailyBreakdown = getDailyBreakdown();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Analytics</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>This Week's Progress</Text>
      </View>

      {/* Key Stats */}
      <View style={styles.statsGrid}>
        <AnimatedCard style={[styles.statCard, { backgroundColor: theme.cardBackground }]}> 
          <Ionicons name="timer-outline" size={32} color={theme.primaryAccent} />
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{formatTime(stats.totalFocusMinutes)}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Focus Time</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: theme.cardBackground }]}> 
          <Ionicons name="play-circle-outline" size={32} color={theme.success} />
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.focusSessionsCompleted}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sessions</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: theme.cardBackground }]}> 
          <Ionicons name="checkmark-circle-outline" size={32} color={theme.secondaryAccent} />
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.habitSuccessPercentage}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Habit Success</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: theme.cardBackground }]}> 
          <Ionicons name="flame-outline" size={32} color={theme.warning} />
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.longestStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Streak</Text>
        </AnimatedCard>
      </View>

      {/* Daily Breakdown */}
      <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Breakdown</Text>
        
        {dailyBreakdown.map((day, index) => {
          const isToday = day.date === new Date().toISOString().split('T')[0];
          const habitPercentage = day.totalHabits > 0 
            ? Math.round((day.habitsCompleted / day.totalHabits) * 100)
            : 0;
          
          return (
            <View key={day.date} style={[styles.dayCard, { backgroundColor: theme.background }, isToday && { backgroundColor: theme.primaryAccent + '20', borderColor: theme.primaryAccent }]}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayName, { color: theme.textPrimary }, isToday && { color: theme.primaryAccent }]}>
                  {day.dayName}
                  {isToday && ' (Today)'}
                </Text>
                <Text style={[styles.dayDate, { color: theme.textSecondary }]}>
                  {new Date(day.date).getDate()}
                </Text>
              </View>
              
              <View style={styles.dayStats}>
                <View style={styles.dayStat}>
                  <Ionicons name="timer-outline" size={16} color={theme.primaryAccent} />
                  <Text style={[styles.dayStatText, { color: theme.textSecondary }]}>
                    {day.focusMinutes > 0 ? formatTime(day.focusMinutes) : '0m'}
                  </Text>
                </View>
                
                <View style={styles.dayStat}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
                  <Text style={[styles.dayStatText, { color: theme.textSecondary }]}>
                    {day.habitsCompleted}/{day.totalHabits} ({habitPercentage}%)
                  </Text>
                </View>
              </View>
              
              {/* Progress bars */}
              <View style={styles.progressBars}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((day.focusMinutes / 120) * 100, 100)}%`,
                        backgroundColor: theme.primaryAccent
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${habitPercentage}%`,
                        backgroundColor: theme.success
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          );
        })}
      </AnimatedCard>

      {/* Insights */}
      <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Insights</Text>
        
        <AnimatedCard style={[styles.insightCard, { backgroundColor: theme.background }]}> 
          <Ionicons name="trending-up-outline" size={24} color={theme.success} />
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Focus Performance</Text>
            <Text style={[styles.insightText, { color: theme.textSecondary }]}>
              {stats.focusSessionsCompleted === 0 
                ? "Start your first focus session to build momentum."
                : stats.totalFocusMinutes >= 120
                ? "Excellent! You're maintaining deep work habits."
                : "Try to reach 2+ hours of focused work this week."
              }
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard style={[styles.insightCard, { backgroundColor: theme.background }]}> 
          <Ionicons name="checkmark-circle-outline" size={24} color={theme.secondaryAccent} />
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Habit Consistency</Text>
            <Text style={[styles.insightText, { color: theme.textSecondary }]}>
              {stats.habitSuccessPercentage >= 80
                ? "Outstanding consistency! Keep up the great work."
                : stats.habitSuccessPercentage >= 60
                ? "Good progress. Focus on the habits you're missing."
                : state.habits.length === 0
                ? "Add some habits to start building better routines."
                : "Small daily actions lead to big results. Stay consistent."
              }
            </Text>
          </View>
        </AnimatedCard>

        {stats.longestStreak > 0 && (
          <AnimatedCard style={[styles.insightCard, { backgroundColor: theme.background }]}> 
            <Ionicons name="flame-outline" size={24} color={theme.warning} />
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Streak Power</Text>
              <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                {stats.longestStreak >= 7
                  ? `Amazing ${stats.longestStreak}-day streak! You're building lasting habits.`
                  : `${stats.longestStreak}-day streak is a great start. Keep going!`
                }
              </Text>
            </View>
          </AnimatedCard>
        )}
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    ...fontStyles.title,
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    ...fontStyles.body,
    color: '#8E8E93',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingBottom: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
    marginRight: '2%',
  },
  statNumber: {
    fontSize: 24,
    ...fontStyles.title,
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    ...fontStyles.body,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    ...fontStyles.subtitle,
    color: '#000000',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  todayCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    ...fontStyles.body,
    color: '#000000',
  },
  todayText: {
    color: '#007AFF',
  },
  dayDate: {
    fontSize: 14,
    ...fontStyles.body,
    color: '#8E8E93',
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayStatText: {
    fontSize: 14,
    ...fontStyles.body,
    color: '#8E8E93',
    marginLeft: 4,
  },
  progressBars: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    ...fontStyles.body,
    color: '#000000',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    ...fontStyles.body,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
