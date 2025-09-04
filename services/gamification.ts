import { Badge, Challenge, UserLevel, GamificationState } from '@/types';
import { EnhancedBadge, ALL_BADGES, checkEnhancedBadgeUnlocks } from './badges';

// XP rewards for different actions
export const XP_REWARDS = {
  HABIT_COMPLETED: 10,
  FOCUS_SESSION_25MIN: 25,
  FOCUS_SESSION_50MIN: 50,
  FOCUS_SESSION_90MIN: 90,
  JOURNAL_ENTRY: 15,
  DAILY_STREAK: 20,
  WEEKLY_GOAL_MET: 100,
} as const;

// Level progression system
export const LEVELS: UserLevel[] = [
  { level: 1, title: 'Beginner', xpRequired: 0, unlockedFeatures: ['basic_tracking'] },
  { level: 2, title: 'Focused', xpRequired: 100, unlockedFeatures: ['themes'] },
  { level: 3, title: 'Consistent', xpRequired: 300, unlockedFeatures: ['advanced_stats'] },
  { level: 4, title: 'Dedicated', xpRequired: 600, unlockedFeatures: ['custom_challenges'] },
  { level: 5, title: 'Disciplined', xpRequired: 1000, unlockedFeatures: ['premium_themes'] },
  { level: 6, title: 'Master', xpRequired: 1500, unlockedFeatures: ['export_data'] },
  { level: 7, title: 'Sage', xpRequired: 2500, unlockedFeatures: ['all_features'] },
];

// Default badges system
export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_focus',
    name: 'First Focus',
    description: 'Complete your first focus session',
    icon: '🎯',
    isUnlocked: false,
    requirement: { type: 'focus_sessions', count: 1 },
  },
  {
    id: 'deep_diver',
    name: 'Deep Diver',
    description: 'Complete 10 focus sessions',
    icon: '🏊‍♂️',
    isUnlocked: false,
    requirement: { type: 'focus_sessions', count: 10 },
  },
  {
    id: 'keeper_of_time',
    name: 'Keeper of Time',
    description: 'Maintain a 7-day streak',
    icon: '⏰',
    isUnlocked: false,
    requirement: { type: 'habit_streak', count: 7 },
  },
  {
    id: 'truth_seeker',
    name: 'Truth Seeker',
    description: 'Write 30 journal entries',
    icon: '📝',
    isUnlocked: false,
    requirement: { type: 'journal_entries', count: 30 },
  },
  {
    id: 'master_of_focus',
    name: 'Master of Focus',
    description: 'Complete 100 hours of focused work',
    icon: '🧘‍♂️',
    isUnlocked: false,
    requirement: { type: 'focus_hours', count: 100 },
  },
  {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    isUnlocked: false,
    requirement: { type: 'habit_streak', count: 30 },
  },
];

// Calculate current level based on XP
export const calculateLevel = (totalXP: number): UserLevel => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

// Calculate XP for focus session based on duration
export const calculateFocusXP = (durationMinutes: number): number => {
  if (durationMinutes >= 90) return XP_REWARDS.FOCUS_SESSION_90MIN;
  if (durationMinutes >= 50) return XP_REWARDS.FOCUS_SESSION_50MIN;
  if (durationMinutes >= 25) return XP_REWARDS.FOCUS_SESSION_25MIN;
  return Math.floor(durationMinutes * 0.5); // 0.5 XP per minute for shorter sessions
};

// Check if any badges should be unlocked
export const checkBadgeUnlocks = (
  badges: Badge[],
  stats: GamificationState['stats'],
  streakCount: number
): Badge[] => {
  return badges.map(badge => {
    if (badge.isUnlocked) return badge;

    let shouldUnlock = false;
    switch (badge.requirement.type) {
      case 'focus_sessions':
        // Approximate focus sessions from total hours (assuming 45min average)
        const estimatedSessions = Math.floor(stats.totalFocusHours * 1.33);
        shouldUnlock = estimatedSessions >= badge.requirement.count;
        break;
      case 'focus_hours':
        shouldUnlock = stats.totalFocusHours >= badge.requirement.count;
        break;
      case 'journal_entries':
        shouldUnlock = stats.totalJournalEntries >= badge.requirement.count;
        break;
      case 'habit_streak':
        shouldUnlock = streakCount >= badge.requirement.count;
        break;
      case 'weekly_streak':
        shouldUnlock = stats.weeklyGoalsMet >= badge.requirement.count;
        break;
    }

    if (shouldUnlock) {
      return {
        ...badge,
        isUnlocked: true,
        unlockedAt: new Date(),
      };
    }
    return badge;
  });
};

// Generate weekly challenges
export const generateWeeklyChallenge = (): Challenge => {
  const challenges = [
    {
      title: 'Focus Master',
      description: 'Complete 5 focus sessions this week',
      target: 5,
      reward: { xp: 100 },
    },
    {
      title: 'Habit Builder',
      description: 'Complete all habits for 5 days',
      target: 5,
      reward: { xp: 150 },
    },
    {
      title: 'Deep Work Champion',
      description: 'Focus for 10 hours this week',
      target: 10,
      reward: { xp: 200, badge: 'weekly_champion' },
    },
    {
      title: 'Reflection Warrior',
      description: 'Write 3 journal entries this week',
      target: 3,
      reward: { xp: 75 },
    },
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);

  return {
    id: `weekly_${Date.now()}`,
    type: 'weekly',
    progress: 0,
    isCompleted: false,
    startDate,
    endDate,
    ...randomChallenge,
  };
};

// Initial gamification state with enhanced badges
export const createInitialGamificationState = (): GamificationState => ({
  totalXP: 0,
  currentXP: 0,
  level: 1,
  currentLevel: LEVELS[0],
  badges: ALL_BADGES.map(badge => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    isUnlocked: badge.isUnlocked,
    requirement: { type: 'enhanced', count: 0 }
  })),
  challenges: [generateWeeklyChallenge()],
  streaks: {
    current: 0,
    longest: 0,
    lastActivityDate: '',
  },
  stats: {
    totalFocusHours: 0,
    totalJournalEntries: 0,
    totalHabitsCompleted: 0,
    weeklyGoalsMet: 0,
  },
});

// Update streak based on activity
export const updateStreak = (
  currentStreak: number,
  lastActivityDate: string,
  longestStreak: number
): { current: number; longest: number; lastActivityDate: string } => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (lastActivityDate === today) {
    // Already counted today
    return { current: currentStreak, longest: longestStreak, lastActivityDate };
  }

  if (lastActivityDate === yesterday) {
    // Continuing streak
    const newStreak = currentStreak + 1;
    return {
      current: newStreak,
      longest: Math.max(newStreak, longestStreak),
      lastActivityDate: today,
    };
  }

  // Starting new streak
  return {
    current: 1,
    longest: Math.max(1, longestStreak),
    lastActivityDate: today,
  };
};
