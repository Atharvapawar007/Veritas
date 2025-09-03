import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Task } from '@/types';
import { AnimatedCard, AnimatedRow } from '@/ui/AnimatedCard';
import { cardSurface } from '@/ui/themeStyles';
import { fontStyles } from '@/ui/fonts';

export default function InboxScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const addTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      note: note.trim() || undefined,
      createdAt: new Date(),
      status: 'pending',
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    setTitle('');
    setNote('');
    Alert.alert('Success', 'Task added to inbox');
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({ 
        type: 'UPDATE_TASK', 
        payload: { ...task, status } 
      });
    }
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_TASK', payload: taskId })
        }
      ]
    );
  };

  const pendingTasks = state.tasks.filter(task => task.status === 'pending');
  const completedTasks = state.tasks.filter(task => task.status === 'completed');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      > 
      {/* Quick Capture Form */}
      <AnimatedCard style={[styles.captureSection, { backgroundColor: theme.cardBackground }]}> 
        <Text style={[styles.sectionTitleCentered, { color: theme.textPrimary }]}>Quick Capture</Text>
        
        <TextInput
          style={[styles.titleInput, { backgroundColor: theme.background, color: theme.textPrimary }]}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          multiline
          autoFocus
        />
        
        <TextInput
          style={[styles.noteInput, { backgroundColor: theme.background, color: theme.textPrimary }]}
          placeholder="Add a note (optional)"
          placeholderTextColor={theme.textSecondary}
          value={note}
          onChangeText={setNote}
          multiline
        />
        
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primaryAccent }]} onPress={addTask}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Pending Tasks */}
      <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
        <Text style={[styles.sectionTitleCentered, { color: theme.textPrimary }]}> 
          Inbox ({pendingTasks.length})
        </Text>
        
        {pendingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Your inbox is empty</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Capture tasks as they come to mind</Text>
          </View>
        ) : (
          pendingTasks.map((task, idx) => (
            <AnimatedRow key={task.id} delay={idx * 50} style={[styles.taskCard, { backgroundColor: theme.background }]}> 
              <TouchableOpacity
                style={styles.taskCheckbox}
                onPress={() => updateTaskStatus(task.id, 'completed')}
              >
                <Ionicons name="ellipse-outline" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>{task.title}</Text>
                {task.note && <Text style={[styles.taskNote, { color: theme.textSecondary }]}>{task.note}</Text>}
                <Text style={[styles.taskDate, { color: theme.textSecondary }]}>
                  Added {new Date(task.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.warning} />
              </TouchableOpacity>
            </AnimatedRow>
          ))
        )}
      </AnimatedCard>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <AnimatedCard style={[styles.section, { backgroundColor: theme.cardBackground }]}> 
          <Text style={[styles.sectionTitleCentered, { color: theme.textPrimary }]}>Completed ({completedTasks.length})</Text>
          {completedTasks.map(task => (
            <AnimatedRow key={task.id} style={[styles.taskCard, { backgroundColor: theme.background, opacity: 0.7 }]}> 
              <TouchableOpacity
                style={styles.taskCheckbox}
                onPress={() => updateTaskStatus(task.id, 'pending')}
              >
                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
              </TouchableOpacity>
              
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
                  {task.title}
                </Text>
                {task.note && (
                  <Text style={[styles.taskNote, { color: theme.textSecondary }]}>
                    {task.note}
                  </Text>
                )}
                <Text style={[styles.taskDate, { color: theme.textSecondary }]}>Completed {new Date(task.createdAt).toLocaleDateString()}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.warning} />
              </TouchableOpacity>
            </AnimatedRow>
          ))}
        </AnimatedCard>
      )}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  captureSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    ...fontStyles.subtitle,
    color: '#000000',
    marginBottom: 16,
  },
  sectionTitleCentered: {
    fontSize: 20,
    ...fontStyles.subtitle,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 18,
    ...fontStyles.input,
    color: '#000000',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  noteInput: {
    fontSize: 16,
    ...fontStyles.input,
    color: '#000000',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...fontStyles.button,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    ...fontStyles.body,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    ...fontStyles.caption,
    color: '#8E8E93',
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskCheckbox: {
    padding: 4,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    ...fontStyles.body,
    color: '#000000',
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskNote: {
    fontSize: 14,
    ...fontStyles.caption,
    color: '#8E8E93',
    marginBottom: 4,
  },
  completedTaskNote: {
    color: '#C7C7CC',
  },
  taskDate: {
    fontSize: 12,
    ...fontStyles.caption,
    color: '#C7C7CC',
  },
  deleteButton: {
    padding: 8,
  },
});
