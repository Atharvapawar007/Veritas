import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Habit, HabitEntry } from '@/types';
import { AnimatedCard, AnimatedRow } from '@/ui/AnimatedCard';
import ProgressRing from '@/ui/ProgressRing';
import BadgeCard from '@/ui/BadgeCard';
import * as Gamification from '@/services/gamification';

export default function HabitsScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const addHabit = () => {
    if (!newHabitTitle.trim() || !newHabitGoal.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      title: newHabitTitle.trim(),
      microGoal: newHabitGoal.trim(),
      streak: 0,
      history: [],
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_HABIT', payload: newHabit });
    setNewHabitTitle('');
    setNewHabitGoal('');
    setShowAddModal(false);
  };

  const toggleHabitCompletion = async (habit: Habit) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const todayEntry = habit.history.find(entry => entry.date === today);
    const isCurrentlyCompleted = todayEntry?.completed || false;

    // Toggle habit completion
    dispatch({
      type: 'TOGGLE_HABIT',
      payload: { habitId: habit.id, date: today }
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
      const updatedStreaks = Gamification.updateStreak(
        state.gamification.streaks.current,
        state.gamification.streaks.lastActivityDate,
        state.gamification.streaks.longest
      );

      dispatch({
        type: 'UPDATE_STREAK',
        payload: updatedStreaks
      });

      // Haptic feedback for completion
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const deleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_HABIT', payload: habitId })
        }
      ]
    );
  };

  const getHabitStatus = (habit: Habit) => {
    const todayEntry = habit.history.find(entry => entry.date === today);
    return todayEntry?.completed || false;
  };

  const getWeeklyProgress = (habit: Habit) => {
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    return weekDates.map(date => {
      const entry = habit.history.find(h => h.date === date);
      return entry?.completed || false;
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      > 
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Habits</Text>
        <View
          style={[
            styles.addButtonWrapper,
            { backgroundColor: theme.primaryAccent + '1F', shadowColor: theme.primaryAccent },
          ]}
        >
          <Pressable
            accessibilityLabel="Add a new habit"
            accessibilityRole="button"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAddModal(true);
            }}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: theme.primaryAccent,
                borderColor: theme.primaryAccent + '55',
                shadowColor: theme.primaryAccent,
                transform: [{ scale: pressed ? 0.94 : 1 }],
                shadowOpacity: pressed ? 0.35 : 0.28,
                elevation: pressed ? 6 : 9,
              },
            ]}
          >
            <Ionicons name="add" size={22} color={'#FFFFFF'} />
          </Pressable>
        </View>
      </View>

      {state.habits.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <AnimatedCard
            style={[
              styles.emptyState,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000000' : '#000000',
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Habits Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Start building better habits with micro-goals</Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primaryAccent }]}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add Your First Habit</Text>
            </TouchableOpacity>
          </AnimatedCard>
        </View>
      ) : (
        <View style={styles.habitsList}>
          {state.habits.map((habit: Habit) => {
            const isCompleted = getHabitStatus(habit);
            const weeklyProgress = getWeeklyProgress(habit);
            
            return (
              <AnimatedCard key={habit.id} style={[styles.habitCard, { 
                backgroundColor: theme.cardBackground,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: theme.isDark ? '#000000' : '#000000'
              }]}> 
                <View style={styles.habitHeader}>
                  <TouchableOpacity
                    style={styles.habitCheckbox}
                    onPress={() => toggleHabitCompletion(habit)}
                  >
                    <Ionicons 
                      name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                      size={32} 
                      color={isCompleted ? theme.success : theme.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.habitInfo}>
                    <Text style={[
                      styles.habitTitle,
                      { color: theme.textPrimary },
                      isCompleted && { textDecorationLine: 'line-through', color: theme.textSecondary }
                    ]}>
                      {habit.title}
                    </Text>
                    <Text style={[styles.habitGoal, { color: theme.textSecondary }]}>{habit.microGoal}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteHabit(habit.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.warning} />
                  </TouchableOpacity>
                </View>

                <View style={styles.habitStats}>
                  <View style={styles.streakContainer}>
                    <Text style={[styles.streakNumber, { color: theme.success }]}>{habit.streak}</Text>
                    <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>day streak</Text>
                  </View>
                  
                  <View style={styles.weeklyContainer}>
                    <Text style={[styles.weeklyLabel, { color: theme.textSecondary }]}>This Week</Text>
                    <View style={styles.weeklyDots}>
                      {weeklyProgress.map((completed, index) => (
                        <AnimatedRow
                          key={index}
                          delay={index * 40}
                          style={[
                            styles.weeklyDot,
                            { backgroundColor: completed ? theme.success : theme.textSecondary + '40' }
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </AnimatedCard>
            );
          })}
        </View>
      )}

      {/* Add Habit Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.textSecondary + '40' }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.primaryAccent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>New Habit</Text>
            <TouchableOpacity onPress={addHabit}>
              <Text style={[styles.modalSave, { color: theme.primaryAccent }]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Habit Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.textSecondary + '40' }]}
              placeholder="e.g., Read for 10 minutes"
              placeholderTextColor={theme.textSecondary}
              value={newHabitTitle}
              onChangeText={setNewHabitTitle}
              autoFocus
            />
            
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Micro Goal</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.textSecondary + '40' }]}
              placeholder="e.g., Read 2 pages minimum"
              placeholderTextColor={theme.textSecondary}
              value={newHabitGoal}
              onChangeText={setNewHabitGoal}
              multiline
            />
            
            <View style={[styles.tipContainer, { backgroundColor: theme.secondaryAccent + '20' }]}>
              <Ionicons name="bulb-outline" size={20} color={theme.secondaryAccent} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Make it so small you can't say no. Start with just 2 minutes or 1 rep.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  addButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 9,
  },
  emptyState: {
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 48,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  habitsList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  habitCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  habitCheckbox: {
    marginRight: 16,
    marginTop: 2,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 4,
  },
  completedHabitTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  habitGoal: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    color: '#34C759',
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
  },
  weeklyContainer: {
    alignItems: 'flex-end',
  },
  weeklyLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginBottom: 8,
  },
  weeklyDots: {
    flexDirection: 'row',
  },
  weeklyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E5EA',
    marginLeft: 4,
  },
  completedDot: {
    backgroundColor: '#34C759',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#007AFF',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#007AFF',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
