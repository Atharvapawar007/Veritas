import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { AnimatedCard, AnimatedRow } from '@/ui/AnimatedCard';
import { cardSurface } from '@/ui/themeStyles';
import { fontStyles } from '@/ui/fonts';

export default function HomeScreen() {
  const { state } = useAppContext();
  const { theme } = useTheme();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];
  const todayTop3 = state.dailyTop3.find(d => d.date === today);
  const todayTasks = todayTop3 
    ? state.tasks.filter(task => todayTop3.taskIds.includes(task.id))
    : [];

  const todayHabits = state.habits.filter(habit => {
    const todayEntry = habit.history.find(entry => entry.date === today);
    return !todayEntry || !todayEntry.completed;
  });

  const completedHabitsToday = state.habits.filter(habit => {
    const todayEntry = habit.history.find(entry => entry.date === today);
    return todayEntry && todayEntry.completed;
  });

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
      <AnimatedCard style={[styles.header, cardSurface(theme), { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Veritas</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </AnimatedCard>

      {/* Top 3 Tasks Section */}
      <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Top 3</Text>
          <TouchableOpacity 
            onPress={() => router.push('/daily-planning')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {todayTasks.length === 0 ? (
          <TouchableOpacity 
            style={styles.emptyCard}
            onPress={() => router.push('/daily-planning')}
          >
            <Text style={styles.emptyText}>Set your top 3 tasks for today</Text>
            <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>
        ) : (
          todayTasks.map((task, index) => (
            <AnimatedRow key={task.id} delay={index * 60} style={styles.taskCard}>
              <View style={styles.taskNumber}>
                <Text style={styles.taskNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.note && <Text style={styles.taskNote}>{task.note}</Text>}
              </View>
              <View style={[
                styles.taskStatus,
                { backgroundColor: task.status === 'completed' ? '#34C759' : '#E5E5EA' }
              ]} />
            </AnimatedRow>
          ))
        )}
      </AnimatedCard>

      {/* Focus Session Button */}
      <TouchableOpacity 
        style={[styles.focusButton, { backgroundColor: theme.primaryAccent }]}
        onPress={() => router.push('/focus-session')}
      >
        <Ionicons name="play-circle" size={24} color="#FFFFFF" />
        <Text style={styles.focusButtonText}>Start Focus Session</Text>
      </TouchableOpacity>

      {/* Today's Habits */}
      <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Habits</Text>
          <Text style={[styles.habitProgress, { color: theme.primaryAccent }]}>{completedHabitsToday.length}/{state.habits.length}</Text>
        </View>
        
        {state.habits.length === 0 ? (
          <TouchableOpacity 
            style={styles.emptyCard}
            onPress={() => router.push('/(tabs)/habits')}
          >
            <Text style={styles.emptyText}>Add your first habit</Text>
            <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>
        ) : (
          <>
            {todayHabits.slice(0, 3).map((habit, idx) => (
              <AnimatedRow key={habit.id} delay={idx * 70} style={styles.habitCard}>
                <View style={styles.habitContent}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitGoal}>{habit.microGoal}</Text>
                </View>
                <View style={styles.habitStreak}>
                  <Text style={styles.streakNumber}>{habit.streak}</Text>
                  <Text style={styles.streakLabel}>day streak</Text>
                </View>
              </AnimatedRow>
            ))}
            {state.habits.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/habits')}
              >
                <Text style={styles.viewAllText}>View all habits</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </AnimatedCard>

      {/* Quick Actions */}
      <AnimatedCard style={[styles.section, styles.lastSection, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitleCentered, { color: theme.textPrimary }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/inbox')}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.primaryAccent} />
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Quick Capture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/journal')}
          >
            <Ionicons name="pause-circle-outline" size={24} color={theme.secondaryAccent} />
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Decision Pause</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
      
      {/* Remove spacer to avoid unnecessary empty space above tab bar */}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'center',
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
  },
  header: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    ...fontStyles.title,
    marginBottom: 4,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    ...fontStyles.body,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    ...fontStyles.subtitle,
  },
  sectionTitleCentered: {
    fontSize: 20,
    ...fontStyles.subtitle,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    ...fontStyles.body,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...fontStyles.body,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
    ...fontStyles.body,
  },
  taskNote: {
    fontSize: 14,
    color: '#8E8E93',
    ...fontStyles.body,
  },
  taskStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },
  focusButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 12,
    ...fontStyles.body,
  },
  habitProgress: {
    fontSize: 16,
    color: '#007AFF',
    ...fontStyles.body,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
    ...fontStyles.body,
  },
  habitGoal: {
    fontSize: 14,
    color: '#8E8E93',
    ...fontStyles.body,
  },
  habitStreak: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 20,
    color: '#34C759',
    ...fontStyles.body,
  },
  streakLabel: {
    fontSize: 12,
    color: '#8E8E93',
    ...fontStyles.body,
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    ...fontStyles.body,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 8,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    ...fontStyles.body,
  },
});
