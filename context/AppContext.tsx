import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, FocusSession, Habit, DailyTop3, JournalEntry, AppSettings } from '@/types';
import * as Storage from '@/services/storage';

interface AppState {
  tasks: Task[];
  focusSessions: FocusSession[];
  habits: Habit[];
  dailyTop3: DailyTop3[];
  journalEntries: JournalEntry[];
  settings: AppSettings;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Omit<AppState, 'loading'> }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_DAILY_TOP3'; payload: DailyTop3 }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings };

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
      const [tasks, focusSessions, habits, dailyTop3, journalEntries, settings] = await Promise.all([
        Storage.getTasks(),
        Storage.getFocusSessions(),
        Storage.getHabits(),
        Storage.getDailyTop3(),
        Storage.getJournalEntries(),
        Storage.getSettings(),
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
