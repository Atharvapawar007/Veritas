import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { clearAllData } from '@/services/storage';
import * as Gamification from '@/services/gamification';

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();
  const { theme, toggleTheme, isDark } = useTheme();
  const [settings, setSettings] = useState(state.settings);

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const clearAllAppData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your tasks, habits, focus sessions, and journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              // Reset state to initial values
              dispatch({ type: 'LOAD_DATA', payload: {
                tasks: [],
                focusSessions: [],
                habits: [],
                dailyTop3: [],
                journalEntries: [],
                settings: {
                  defaultFocusDuration: 25,
                  shortBreakDuration: 5,
                  longBreakDuration: 15,
                  notificationsEnabled: true,
                  remindersEnabled: true,
                },
                gamification: Gamification.createInitialGamificationState(),
              }});
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const durations = [15, 25, 30, 45, 50, 60, 90];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        </View>

      {/* Focus Settings */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Focus Sessions</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Default Duration</Text>
          <View style={styles.durationSelector}>
            {durations.map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  { backgroundColor: settings.defaultFocusDuration === duration ? theme.primaryAccent : theme.background },
                  { borderColor: settings.defaultFocusDuration === duration ? theme.primaryAccent : 'transparent' }
                ]}
                onPress={() => updateSetting('defaultFocusDuration', duration)}
              >
                <Text style={[
                  styles.durationText,
                  { color: settings.defaultFocusDuration === duration ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Short Break Duration</Text>
          <View style={styles.durationSelector}>
            {[5, 10, 15].map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  { backgroundColor: settings.shortBreakDuration === duration ? theme.primaryAccent : theme.background },
                  { borderColor: settings.shortBreakDuration === duration ? theme.primaryAccent : 'transparent' }
                ]}
                onPress={() => updateSetting('shortBreakDuration', duration)}
              >
                <Text style={[
                  styles.durationText,
                  { color: settings.shortBreakDuration === duration ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Long Break Duration</Text>
          <View style={styles.durationSelector}>
            {[15, 20, 30].map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  { backgroundColor: settings.longBreakDuration === duration ? theme.primaryAccent : theme.background },
                  { borderColor: settings.longBreakDuration === duration ? theme.primaryAccent : 'transparent' }
                ]}
                onPress={() => updateSetting('longBreakDuration', duration)}
              >
                <Text style={[
                  styles.durationText,
                  { color: settings.longBreakDuration === duration ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Appearance Settings */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>
        
        <View style={styles.switchItem}>
          <View style={styles.switchContent}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={theme.primaryAccent} />
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.textSecondary, true: theme.primaryAccent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Notification Settings */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notifications</Text>
        
        <View style={[styles.switchItem, { borderBottomColor: theme.background }]}>
          <View style={styles.switchContent}>
            <Ionicons name="notifications-outline" size={20} color={theme.primaryAccent} />
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Notifications</Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Get notified when focus sessions end
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
            trackColor={{ false: theme.textSecondary, true: theme.primaryAccent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.switchItem, { borderBottomColor: theme.background }]}>
          <View style={styles.switchContent}>
            <Ionicons name="alarm-outline" size={20} color={theme.secondaryAccent} />
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Daily Reminders</Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Remind you to plan your day and review habits
              </Text>
            </View>
          </View>
          <Switch
            value={settings.remindersEnabled}
            onValueChange={(value) => updateSetting('remindersEnabled', value)}
            trackColor={{ false: theme.textSecondary, true: theme.primaryAccent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>About</Text>
        
        <View style={[styles.infoItem, { borderBottomColor: theme.background }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>Veritas</Text>
            <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
              A productivity app based on Deep Work, Atomic Habits, and Thinking Fast and Slow principles
            </Text>
          </View>
        </View>

        <View style={[styles.infoItem, { borderBottomColor: theme.background }]}>
          <Ionicons name="stats-chart-outline" size={20} color={theme.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>Your Progress</Text>
            <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
              {state.tasks.length} tasks • {state.habits.length} habits • {state.focusSessions.length} focus sessions
            </Text>
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Data Management</Text>
        
        <TouchableOpacity style={styles.dangerItem} onPress={clearAllAppData}>
          <Ionicons name="trash-outline" size={20} color={theme.warning} />
          <View style={styles.dangerContent}>
            <Text style={[styles.dangerLabel, { color: theme.warning }]}>Clear All Data</Text>
            <Text style={[styles.dangerDescription, { color: theme.textSecondary }]}>
              Permanently delete all tasks, habits, and progress
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={[styles.section, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme.isDark ? '#000000' : '#000000'
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Productivity Tips</Text>
        
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={16} color={theme.secondaryAccent} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            <Text style={[styles.tipBold, { color: theme.textPrimary }]}>Deep Work:</Text> Schedule uninterrupted blocks for your most important work
          </Text>
        </View>
        
        <View style={styles.tip}>
          <Ionicons name="repeat-outline" size={16} color={theme.success} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            <Text style={[styles.tipBold, { color: theme.textPrimary }]}>Atomic Habits:</Text> Make habits so small you can't say no (2-minute rule)
          </Text>
        </View>
        
        <View style={styles.tip}>
          <Ionicons name="pause-outline" size={16} color={theme.primaryAccent} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            <Text style={[styles.tipBold, { color: theme.textPrimary }]}>Slow Thinking:</Text> Use Decision Pause when feeling reactive or scattered
          </Text>
        </View>
      </View>
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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  section: {
    marginHorizontal: 24,
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
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDuration: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  durationText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    marginLeft: 16,
    flex: 1,
  },
  switchLabel: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    lineHeight: 20,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dangerContent: {
    marginLeft: 16,
    flex: 1,
  },
  dangerLabel: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    lineHeight: 20,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  tipBold: {
    fontFamily: 'SF Pro Display Bold',
    color: '#000000',
  },
});
