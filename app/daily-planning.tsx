import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { DailyTop3, Task } from '@/types';

export default function DailyPlanningScreen() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const todayTop3 = state.dailyTop3.find(d => d.date === today);
  const pendingTasks = state.tasks.filter(task => task.status === 'pending');

  useEffect(() => {
    if (todayTop3) {
      setSelectedTasks(todayTop3.taskIds);
    }
  }, [todayTop3]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else if (prev.length < 3) {
        return [...prev, taskId];
      } else {
        Alert.alert('Limit Reached', 'You can only select up to 3 tasks for today.');
        return prev;
      }
    });
  };

  const saveDailyTop3 = () => {
    if (selectedTasks.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task for today.');
      return;
    }

    const newDailyTop3: DailyTop3 = {
      date: today,
      taskIds: selectedTasks,
    };

    dispatch({ type: 'SET_DAILY_TOP3', payload: newDailyTop3 });
    
    Alert.alert(
      'Daily Plan Set!',
      `You've selected ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''} for today.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const getSelectedTasks = () => {
    return selectedTasks
      .map(id => state.tasks.find(task => task.id === id))
      .filter(task => task !== undefined) as Task[];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Planning</Text>
        <TouchableOpacity onPress={saveDailyTop3}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Choose Your Top 3</Text>
          <Text style={styles.introSubtitle}>
            Select up to 3 most important tasks for today. Focus on what truly matters.
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Selected Tasks Preview */}
        {selectedTasks.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>Today's Focus ({selectedTasks.length}/3)</Text>
            {getSelectedTasks().map((task, index) => (
              <View key={task.id} style={styles.selectedTaskCard}>
                <View style={styles.taskNumber}>
                  <Text style={styles.taskNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.selectedTaskTitle}>{task.title}</Text>
                  {task.note && <Text style={styles.selectedTaskNote}>{task.note}</Text>}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => toggleTaskSelection(task.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Tasks */}
        <View style={styles.availableSection}>
          <Text style={styles.sectionTitle}>Available Tasks</Text>
          
          {pendingTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>No pending tasks</Text>
              <Text style={styles.emptySubtext}>
                Add tasks in the Inbox to plan your day
              </Text>
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Text style={styles.addTaskButtonText}>Add Tasks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            pendingTasks.map(task => {
              const isSelected = selectedTasks.includes(task.id);
              const isDisabled = !isSelected && selectedTasks.length >= 3;
              
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskCard,
                    isSelected && styles.selectedTaskCardBorder,
                    isDisabled && styles.disabledTaskCard
                  ]}
                  onPress={() => !isDisabled && toggleTaskSelection(task.id)}
                  disabled={isDisabled}
                >
                  <View style={styles.taskCheckbox}>
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={isSelected ? "#007AFF" : (isDisabled ? "#C7C7CC" : "#8E8E93")} 
                    />
                  </View>
                  
                  <View style={styles.taskInfo}>
                    <Text style={[
                      styles.taskTitle,
                      isDisabled && styles.disabledTaskTitle
                    ]}>
                      {task.title}
                    </Text>
                    {task.note && (
                      <Text style={[
                        styles.taskNote,
                        isDisabled && styles.disabledTaskNote
                      ]}>
                        {task.note}
                      </Text>
                    )}
                    <Text style={styles.taskDate}>
                      Added {new Date(task.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Planning Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Planning Tips</Text>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color="#FF9500" />
            <Text style={styles.tipText}>
              Choose tasks that align with your most important goals
            </Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.tipText}>
              Estimate 2-4 hours of focused work per task
            </Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="trending-up-outline" size={16} color="#34C759" />
            <Text style={styles.tipText}>
              Start with the most challenging task when your energy is highest
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectedSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  availableSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  selectedTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  taskContent: {
    flex: 1,
  },
  selectedTaskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  selectedTaskNote: {
    fontSize: 14,
    color: '#8E8E93',
  },
  removeButton: {
    padding: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTaskCardBorder: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  disabledTaskCard: {
    opacity: 0.5,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  disabledTaskTitle: {
    color: '#C7C7CC',
  },
  taskNote: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  disabledTaskNote: {
    color: '#C7C7CC',
  },
  taskDate: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 20,
  },
  addTaskButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
