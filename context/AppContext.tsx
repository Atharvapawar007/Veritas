import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, FocusSession, Habit, DailyTop3, JournalEntry, AppSettings, GamificationState, AppState, AppAction } from '@/types';
import * as Storage from '@/services/storage';
import * as Gamification from '@/services/gamification';

const initialState: AppState = {
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
  loading: true,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_FOCUS_SESSION':
      return { ...state, focusSessions: [...state.focusSessions, action.payload] };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
      };
    case 'TOGGLE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === action.payload.habitId) {
            const existingEntry = habit.history.find(entry => entry.date === action.payload.date);
            const updatedHistory = existingEntry
              ? habit.history.map(entry =>
                  entry.date === action.payload.date
                    ? { ...entry, completed: !entry.completed }
                    : entry
                )
              : [...habit.history, { date: action.payload.date, completed: true }];
            // Recompute streak based on updated history
            const completedDates = new Set(
              updatedHistory.filter(h => h.completed).map(h => h.date)
            );

            const toDateStr = (d: Date) => d.toISOString().split('T')[0];
            const today = new Date();
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const countConsecutive = (start: Date): number => {
              let count = 0;
              let cursor = new Date(start);
              while (completedDates.has(toDateStr(cursor))) {
                count += 1;
                cursor.setDate(cursor.getDate() - 1);
              }
              return count;
            };

            const hasToday = completedDates.has(toDateStr(today));
            const hasYesterday = completedDates.has(toDateStr(yesterday));

            const newStreak = hasToday
              ? countConsecutive(today)
              : hasYesterday
                ? countConsecutive(yesterday)
                : 0;

            return { ...habit, history: updatedHistory, streak: newStreak };
          }
          return habit;
        }),
      };
    case 'SET_DAILY_TOP3':
      return {
        ...state,
        dailyTop3: state.dailyTop3.filter(d => d.date !== action.payload.date)
          .concat(action.payload),
      };
    case 'ADD_JOURNAL_ENTRY':
      return { ...state, journalEntries: [...state.journalEntries, action.payload] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_GAMIFICATION':
      return { ...state, gamification: action.payload };
    case 'ADD_XP':
      const newTotalXP = state.gamification.totalXP + action.payload;
      const newLevel = Gamification.calculateLevel(newTotalXP);
      return {
        ...state,
        gamification: {
          ...state.gamification,
          totalXP: newTotalXP,
          currentLevel: newLevel,
        },
      };
    case 'UNLOCK_BADGE':
      return {
        ...state,
        gamification: {
          ...state.gamification,
          badges: state.gamification.badges.map(badge =>
            badge.id === action.payload
              ? { ...badge, isUnlocked: true, unlockedAt: new Date() }
              : badge
          ),
        },
      };
    case 'UPDATE_STREAK':
      return {
        ...state,
        gamification: {
          ...state.gamification,
          streaks: action.payload,
        },
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasks, focusSessions, habits, dailyTop3, journalEntries, settings, gamification] = await Promise.all([
        Storage.getTasks(),
        Storage.getFocusSessions(),
        Storage.getHabits(),
        Storage.getDailyTop3(),
        Storage.getJournalEntries(),
        Storage.getSettings(),
        Storage.getGamificationState(),
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          tasks,
          focusSessions,
          habits,
          dailyTop3,
          journalEntries,
          settings,
          gamification: gamification || Gamification.createInitialGamificationState(),
        },
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Auto-save data when state changes
  useEffect(() => {
    if (!state.loading) {
      Storage.storeTasks(state.tasks);
    }
  }, [state.tasks, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeFocusSessions(state.focusSessions);
    }
  }, [state.focusSessions, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeHabits(state.habits);
    }
  }, [state.habits, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeDailyTop3(state.dailyTop3);
    }
  }, [state.dailyTop3, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeJournalEntries(state.journalEntries);
    }
  }, [state.journalEntries, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeSettings(state.settings);
    }
  }, [state.settings, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      Storage.storeGamificationState(state.gamification);
    }
  }, [state.gamification, state.loading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
