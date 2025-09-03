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
