import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { FocusSession, Task } from '@/types';

export default function FocusSessionScreen() {
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState(state.settings.defaultFocusDuration);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations = [25, 50, 90];
  const pendingTasks = state.tasks.filter(task => task.status === 'pending');

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startSession = () => {
    setIsRunning(true);
    setSessionStartTime(new Date());
    setTimeLeft(selectedDuration * 60);
    setInterruptions(0);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    setIsRunning(true);
  };

  const addInterruption = () => {
    setInterruptions(prev => prev + 1);
  };

  const endSessionEarly = () => {
    Alert.alert(
      'End Session Early?',
      'Are you sure you want to end this focus session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: completeSession
        }
      ]
    );
  };

  const completeSession = () => {
    if (!sessionStartTime) return;

    const endTime = new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
    
    const newSession: FocusSession = {
      id: Date.now().toString(),
      startTime: sessionStartTime,
      endTime,
      plannedDuration: selectedDuration,
      actualDuration,
      taskId: selectedTask?.id,
      interruptions,
    };

    dispatch({ type: 'ADD_FOCUS_SESSION', payload: newSession });
    
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setSessionStartTime(null);
    setInterruptions(0);

    Alert.alert(
      'Session Complete!',
      `Great work! You focused for ${actualDuration} minutes.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isRunning && !sessionStartTime) {
    // Setup screen
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.textSecondary }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Focus Session</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.setupContent}>
          <Text style={[styles.setupTitle, { color: theme.textPrimary }]}>Choose Duration</Text>
          <View style={styles.durationOptions}>
            {durations.map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  { backgroundColor: selectedDuration === duration ? theme.primaryAccent : theme.textSecondary },
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Text style={[
                  styles.durationText,
                  { color: selectedDuration === duration ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.setupTitle, { color: theme.textPrimary }]}>Select Task (Optional)</Text>
          <TouchableOpacity
            style={[styles.taskSelector, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowTaskSelector(true)}
          >
            <Text style={[styles.taskSelectorText, { color: theme.textPrimary }]}>
              {selectedTask ? selectedTask.title : 'No task selected'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.primaryAccent }]} onPress={startSession}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Focus Session</Text>
          </TouchableOpacity>
        </View>

        {/* Task Selector Modal */}
        <Modal visible={showTaskSelector} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.textSecondary }]}>
              <TouchableOpacity onPress={() => setShowTaskSelector(false)}>
                <Text style={[styles.modalCancel, { color: theme.primaryAccent }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Task</Text>
              <TouchableOpacity onPress={() => {
                setSelectedTask(null);
                setShowTaskSelector(false);
              }}>
                <Text style={[styles.modalClear, { color: theme.warning }]}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.taskList}>
              {pendingTasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskOption, { backgroundColor: theme.cardBackground }]}
                  onPress={() => {
                    setSelectedTask(task);
                    setShowTaskSelector(false);
                  }}
                >
                  <Text style={[styles.taskOptionTitle, { color: theme.textPrimary }]}>{task.title}</Text>
                  {task.note && <Text style={[styles.taskOptionNote, { color: theme.textSecondary }]}>{task.note}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Timer screen
  return (
    <View style={[styles.timerContainer, { backgroundColor: theme.primaryAccent }]}>
      <View style={styles.timerHeader}>
        <TouchableOpacity onPress={endSessionEarly}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.timerHeaderTitle}>Focus Session</Text>
        <TouchableOpacity onPress={addInterruption}>
          <Ionicons name="alert-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerContent}>
        {selectedTask && (
          <Text style={styles.currentTask}>{selectedTask.title}</Text>
        )}

        <View style={styles.timerCircle}>
          <Svg width="280" height="280" style={styles.progressRing}>
            <Circle
              cx="140"
              cy="140"
              r="120"
              stroke="#FFFFFF"
              strokeWidth="8"
              fill="transparent"
              opacity={0.3}
            />
            <Circle
              cx="140"
              cy="140"
              r="120"
              stroke="#FFFFFF"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 140 140)"
            />
          </Svg>
          <View style={styles.timerText}>
            <Text style={styles.timeDisplay}>{formatTime(timeLeft)}</Text>
            <Text style={styles.durationLabel}>{selectedDuration} min session</Text>
          </View>
        </View>

        <View style={styles.timerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={isRunning ? pauseSession : resumeSession}
          >
            <Ionicons 
              name={isRunning ? "pause" : "play"} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {interruptions > 0 && (
          <View style={styles.interruptionCounter}>
            <Ionicons name="alert-circle" size={16} color={theme.secondaryAccent} />
            <Text style={[styles.interruptionText, { color: theme.secondaryAccent }]}>
              {interruptions} interruption{interruptions !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
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
  setupContent: {
    flex: 1,
    padding: 20,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginTop: 32,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  durationButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: '#007AFF',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  taskSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 32,
  },
  taskSelectorText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 'auto',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
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
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalClear: {
    fontSize: 16,
    color: '#FF3B30',
  },
  taskList: {
    padding: 20,
  },
  taskOption: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  taskOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  taskOptionNote: {
    fontSize: 14,
    color: '#8E8E93',
  },
  timerContainer: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  timerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  currentTask: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    transform: [{ rotate: '0deg' }],
  },
  timerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  durationLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  timerControls: {
    marginTop: 60,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interruptionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: 16,
  },
  interruptionText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
