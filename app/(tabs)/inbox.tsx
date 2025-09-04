import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { Task } from '@/types';
import { AnimatedCard, AnimatedRow } from '@/ui/AnimatedCard';

export default function InboxScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const { error, success } = useToast();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const addTask = () => {
    if (!title.trim()) {
      error('Error', 'Please enter a task title');
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
    success('Success', 'Task added to inbox');
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({ 
        type: 'UPDATE_TASK', 
        payload: { 
          ...task, 
          status,
          completedAt: status === 'completed' ? new Date() : undefined,
        } 
      });
    }
  };

  const deleteTask = (taskId: string) => {
    error(
      'Delete Task',
      'Are you sure you want to delete this task?',
      {
        label: 'Delete',
        onPress: () => dispatch({ type: 'DELETE_TASK', payload: taskId })
      }
    );
  };

  const pendingTasks = state.tasks.filter((task: Task) => task.status === 'pending');
  const completedTasks = state.tasks.filter((task: Task) => task.status === 'completed');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      > 
      {/* Quick Capture Form */}
      <LinearGradient
        colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
        style={styles.captureSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      > 
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
      </LinearGradient>

      {/* Pending Tasks */}
      <LinearGradient
        colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
        style={styles.section}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      > 
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
            <AnimatedRow key={task.id} delay={idx * 50} style={[styles.taskCard, { 
              backgroundColor: theme.background,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              shadowColor: theme.isDark ? '#000000' : '#000000'
            }]}> 
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
      </LinearGradient>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
          style={styles.section}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        > 
          <Text style={[styles.sectionTitleCentered, { color: theme.textPrimary }]}>Completed ({completedTasks.length})</Text>
          {completedTasks.map(task => (
            <AnimatedRow key={task.id} style={[styles.taskCard, { 
              backgroundColor: theme.background, 
              opacity: 0.7,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              shadowColor: theme.isDark ? '#000000' : '#000000'
            }]}> 
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
                <Text style={[styles.taskDate, { color: theme.textSecondary }]}>Completed {new Date(task.completedAt || task.createdAt).toLocaleDateString()}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.warning} />
              </TouchableOpacity>
            </AnimatedRow>
          ))}
        </LinearGradient>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
    flexGrow: 1,
  },
  captureSection: {
    padding: 24,
    paddingTop: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 16,
  },
  sectionTitleCentered: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    minHeight: 50,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  noteInput: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
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
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskNote: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginBottom: 4,
  },
  completedTaskNote: {
    color: '#C7C7CC',
  },
  taskDate: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#C7C7CC',
  },
  deleteButton: {
    padding: 8,
  },
});
