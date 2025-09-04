export interface Task {
  id: string;
  title: string;
  note?: string;
  createdAt: Date;
  dueAt?: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  plannedDuration: number; // in minutes
  actualDuration: number; // in minutes
  taskId?: string;
  notes?: string;
  interruptions: number;
}

export interface Habit {
  id: string;
  title: string;
  microGoal: string;
  schedule?: string;
  streak: number;
  history: HabitEntry[];
  createdAt: Date;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export interface DailyTop3 {
  date: string; // YYYY-MM-DD format
  taskIds: string[];
}

export interface JournalEntry {
  id: string;
  timestamp: Date;
  q1: string; // Why am I doing this?
  q2: string; // Will it help my top 3?
  q3: string; // If not, what else?
}

export interface AppSettings {
  defaultFocusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
}

export interface WeeklyStats {
  totalFocusMinutes: number;
  focusSessionsCompleted: number;
  habitSuccessPercentage: number;
  longestStreak: number;
  weekStartDate: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  requirement: {
    type: 'focus_sessions' | 'focus_hours' | 'journal_entries' | 'habit_streak' | 'weekly_streak' | 'enhanced';
    count: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly';
  target: number;
  progress: number;
  isCompleted: boolean;
  startDate: Date;
  endDate: Date;
  reward: {
    xp: number;
    badge?: string;
  };
}

export interface UserLevel {
  level: number;
  title: string;
  xpRequired: number;
  unlockedFeatures: string[];
}

export interface GamificationState {
  totalXP: number;
  currentXP: number;
  level: number;
  currentLevel: UserLevel;
  badges: Badge[];
  challenges: Challenge[];
  streaks: {
    current: number;
    longest: number;
    lastActivityDate: string;
  };
  stats: {
    totalFocusHours: number;
    totalJournalEntries: number;
    totalHabitsCompleted: number;
    weeklyGoalsMet: number;
  };
}

export interface AppState {
  tasks: Task[];
  focusSessions: FocusSession[];
  habits: Habit[];
  dailyTop3: DailyTop3[];
  journalEntries: JournalEntry[];
  settings: AppSettings;
  gamification: GamificationState;
  loading: boolean;
}

export type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT'; payload: { habitId: string; date: string } }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'SET_DAILY_TOP3'; payload: DailyTop3 }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_GAMIFICATION'; payload: GamificationState }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: { current: number; longest: number; lastActivityDate: string } }
  | { type: 'UNLOCK_BADGE'; payload: string }
  | { type: 'ADD_CHALLENGE'; payload: Challenge }
  | { type: 'UPDATE_CHALLENGE'; payload: Challenge };
