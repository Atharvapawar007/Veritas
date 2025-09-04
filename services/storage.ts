import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, FocusSession, Habit, DailyTop3, JournalEntry, AppSettings, GamificationState } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'tasks',
  FOCUS_SESSIONS: 'focus_sessions',
  HABITS: 'habits',
  DAILY_TOP3: 'daily_top3',
  JOURNAL_ENTRIES: 'journal_entries',
  SETTINGS: 'settings',
  GAMIFICATION: 'gamification',
};

// Generic storage functions
const storeData = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

const getData = async <T>(key: string): Promise<T[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return [];
  }
};

const storeObject = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

const getObject = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return defaultValue;
  }
};

// Task storage functions
export const storeTasks = (tasks: Task[]): Promise<void> => 
  storeData(STORAGE_KEYS.TASKS, tasks);

export const getTasks = (): Promise<Task[]> => 
  getData<Task>(STORAGE_KEYS.TASKS);

// Focus session storage functions
export const storeFocusSessions = (sessions: FocusSession[]): Promise<void> => 
  storeData(STORAGE_KEYS.FOCUS_SESSIONS, sessions);

export const getFocusSessions = (): Promise<FocusSession[]> => 
  getData<FocusSession>(STORAGE_KEYS.FOCUS_SESSIONS);

// Habit storage functions
export const storeHabits = (habits: Habit[]): Promise<void> => 
  storeData(STORAGE_KEYS.HABITS, habits);

export const getHabits = (): Promise<Habit[]> => 
  getData<Habit>(STORAGE_KEYS.HABITS);

// Daily Top 3 storage functions
export const storeDailyTop3 = (dailyTop3: DailyTop3[]): Promise<void> => 
  storeData(STORAGE_KEYS.DAILY_TOP3, dailyTop3);

export const getDailyTop3 = (): Promise<DailyTop3[]> => 
  getData<DailyTop3>(STORAGE_KEYS.DAILY_TOP3);

// Journal entry storage functions
export const storeJournalEntries = (entries: JournalEntry[]): Promise<void> => 
  storeData(STORAGE_KEYS.JOURNAL_ENTRIES, entries);

export const getJournalEntries = (): Promise<JournalEntry[]> => 
  getData<JournalEntry>(STORAGE_KEYS.JOURNAL_ENTRIES);

// Settings storage functions
export const storeSettings = (settings: AppSettings): Promise<void> => 
  storeObject(STORAGE_KEYS.SETTINGS, settings);

export const getSettings = (): Promise<AppSettings> => {
  const defaultSettings: AppSettings = {
    defaultFocusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    notificationsEnabled: true,
    remindersEnabled: true,
  };
  return getObject(STORAGE_KEYS.SETTINGS, defaultSettings);
};

// Gamification storage functions
export const storeGamificationState = (gamification: GamificationState): Promise<void> => 
  storeObject(STORAGE_KEYS.GAMIFICATION, gamification);

export const getGamificationState = (): Promise<GamificationState | null> => {
  return getObject(STORAGE_KEYS.GAMIFICATION, null);
};

// Clear all data function
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
