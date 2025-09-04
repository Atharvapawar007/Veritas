import { Badge, GamificationState } from '@/types';

// Enhanced Badge System for Veritas Productivity App
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'streak' | 'focus' | 'habit' | 'special' | 'seasonal' | 'hidden' | 'collection';
export type BadgePowerType = 'streak_shield' | 'xp_boost' | 'focus_multiplier' | 'habit_freeze' | null;

export interface EnhancedBadge extends Omit<Badge, 'requirement'> {
  category: BadgeCategory;
  tier: BadgeTier;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  visualDesign: {
    primaryColor: string;
    secondaryColor: string;
    gradient: [string, string];
    shape: 'circle' | 'shield' | 'star' | 'hexagon' | 'diamond';
    borderColor: string;
    glowColor: string;
    shadowIntensity: number;
    iconSymbol: string;
    backgroundPattern?: 'dots' | 'rays' | 'waves' | 'geometric';
  };
  unlockCriteria: {
    type: string;
    value: number;
    additionalConditions?: Record<string, any>;
  };
  powerUp?: {
    type: BadgePowerType;
    duration: number;
    effect: string;
  };
  collectionId?: string;
  isHidden: boolean;
  unlockMessage: string;
  celebrationEffect: 'confetti' | 'sparkles' | 'glow' | 'bounce' | 'fireworks';
}

// STREAK BADGES - The Path of Consistency
export const STREAK_BADGES: EnhancedBadge[] = [
  {
    id: 'spark_igniter', name: 'Spark Igniter', description: 'Your journey begins with a single flame',
    icon: '✨', category: 'streak', tier: 'bronze', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'ve lit the spark of consistency!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FF6B35', secondaryColor: '#FFB347', gradient: ['#FF6B35', '#FFB347'],
      shape: 'circle', borderColor: '#CD853F', glowColor: '#FF6B35', shadowIntensity: 0.3, iconSymbol: '✨' },
    unlockCriteria: { type: 'daily_streak', value: 3 }
  },
  {
    id: 'flame_keeper', name: 'Flame Keeper', description: 'Your dedication burns bright for a full week',
    icon: '🔥', category: 'streak', tier: 'silver', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your flame burns steadily!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#FF4500', secondaryColor: '#FF8C00', gradient: ['#FF4500', '#FF8C00'],
      shape: 'shield', borderColor: '#C0C0C0', glowColor: '#FF4500', shadowIntensity: 0.4, iconSymbol: '🔥' },
    unlockCriteria: { type: 'daily_streak', value: 7 },
    powerUp: { type: 'streak_shield', duration: 24, effect: 'Protects streak for 1 day' }
  },
  {
    id: 'bonfire_master', name: 'Bonfire Master', description: 'Your consistency blazes like a roaring bonfire',
    icon: '🔥', category: 'streak', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your dedication roars like a bonfire!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FF6347', gradient: ['#FFD700', '#FF6347'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FFD700', shadowIntensity: 0.5, iconSymbol: '🔥' },
    unlockCriteria: { type: 'daily_streak', value: 30 },
    powerUp: { type: 'xp_boost', duration: 48, effect: '2x XP for 48 hours' }
  },
  {
    id: 'inferno_legend', name: 'Inferno Legend', description: 'Your consistency burns with legendary intensity',
    icon: '🌋', category: 'streak', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'You are a legend of consistency!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#8A2BE2', secondaryColor: '#FF1493', gradient: ['#8A2BE2', '#FF1493'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#8A2BE2', shadowIntensity: 0.7, iconSymbol: '🌋' },
    unlockCriteria: { type: 'daily_streak', value: 100 }
  }
];

// FOCUS BADGES - The Journey of Deep Work  
export const FOCUS_BADGES: EnhancedBadge[] = [
  {
    id: 'focus_seedling', name: 'Focus Seedling', description: 'Your first step into deep work',
    icon: '🌱', category: 'focus', tier: 'bronze', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'ve planted the seed of focus!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#32CD32', secondaryColor: '#90EE90', gradient: ['#32CD32', '#90EE90'],
      shape: 'circle', borderColor: '#228B22', glowColor: '#32CD32', shadowIntensity: 0.3, iconSymbol: '🌱' },
    unlockCriteria: { type: 'total_focus_hours', value: 1 }
  },
  {
    id: 'focus_tree', name: 'Focus Tree', description: 'Your concentration has grown magnificent',
    icon: '🌳', category: 'focus', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your focus has grown into a mighty tree!', celebrationEffect: 'confetti',
    visualDesign: { primaryColor: '#8FBC8F', secondaryColor: '#006400', gradient: ['#8FBC8F', '#006400'],
      shape: 'shield', borderColor: '#DAA520', glowColor: '#8FBC8F', shadowIntensity: 0.5, iconSymbol: '🌳' },
    unlockCriteria: { type: 'total_focus_hours', value: 50 }
  },
  {
    id: 'focus_forest', name: 'Focus Forest', description: 'You\'ve cultivated an entire forest of deep work',
    icon: '🌲', category: 'focus', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'ve grown a forest of focus!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#2E8B57', secondaryColor: '#00FF7F', gradient: ['#2E8B57', '#00FF7F'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#2E8B57', shadowIntensity: 0.7, iconSymbol: '🌲' },
    unlockCriteria: { type: 'total_focus_hours', value: 200 }
  },
  {
    id: 'pomodoro_novice', name: 'Pomodoro Novice', description: 'Your first 25-minute focus session',
    icon: '🍅', category: 'focus', tier: 'bronze', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'Welcome to focused productivity!', celebrationEffect: 'bounce',
    visualDesign: { primaryColor: '#FF6347', secondaryColor: '#FFB347', gradient: ['#FF6347', '#FFB347'],
      shape: 'circle', borderColor: '#CD853F', glowColor: '#FF6347', shadowIntensity: 0.3, iconSymbol: '🍅' },
    unlockCriteria: { type: 'focus_sessions_completed', value: 1 }
  },
  {
    id: 'deep_diver', name: 'Deep Diver', description: 'You\'ve plunged deep into focused work',
    icon: '🏊‍♂️', category: 'focus', tier: 'silver', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'re diving deep into productivity!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#4682B4', secondaryColor: '#87CEEB', gradient: ['#4682B4', '#87CEEB'],
      shape: 'hexagon', borderColor: '#C0C0C0', glowColor: '#4682B4', shadowIntensity: 0.4, iconSymbol: '🏊‍♂️' },
    unlockCriteria: { type: 'focus_sessions_completed', value: 25 }
  },
  {
    id: 'marathon_runner', name: 'Marathon Runner', description: 'You completed a 4-hour focus marathon',
    icon: '🏃‍♂️', category: 'special', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'You ran a marathon of focus!', celebrationEffect: 'confetti',
    visualDesign: { primaryColor: '#FF4500', secondaryColor: '#FF8C00', gradient: ['#FF4500', '#FF8C00'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FF4500', shadowIntensity: 0.5, iconSymbol: '🏃‍♂️' },
    unlockCriteria: { type: 'daily_focus_hours', value: 4, additionalConditions: { singleDay: true } }
  }
];

// HABIT BADGES - The Garden of Growth
export const HABIT_BADGES: EnhancedBadge[] = [
  {
    id: 'habit_sprout', name: 'Habit Sprout', description: 'You\'ve planted your first habit seed',
    icon: '🌱', category: 'habit', tier: 'bronze', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your first habit is taking root!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#9ACD32', secondaryColor: '#ADFF2F', gradient: ['#9ACD32', '#ADFF2F'],
      shape: 'circle', borderColor: '#228B22', glowColor: '#9ACD32', shadowIntensity: 0.3, iconSymbol: '🌱' },
    unlockCriteria: { type: 'habits_completed', value: 1 }
  },
  {
    id: 'routine_builder', name: 'Routine Builder', description: 'Building the foundation of lasting change',
    icon: '🏗️', category: 'habit', tier: 'silver', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'re building powerful routines!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#DAA520', secondaryColor: '#FFD700', gradient: ['#DAA520', '#FFD700'],
      shape: 'hexagon', borderColor: '#C0C0C0', glowColor: '#DAA520', shadowIntensity: 0.4, iconSymbol: '🏗️' },
    unlockCriteria: { type: 'habits_completed', value: 50 }
  },
  {
    id: 'transformation_master', name: 'Transformation Master', description: 'You\'ve mastered personal transformation',
    icon: '🦋', category: 'habit', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'ve transformed into your best self!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#9370DB', secondaryColor: '#DDA0DD', gradient: ['#9370DB', '#DDA0DD'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#9370DB', shadowIntensity: 0.7, iconSymbol: '🦋' },
    unlockCriteria: { type: 'habits_completed', value: 500 }
  }
];

// SPECIAL ACHIEVEMENT BADGES
export const SPECIAL_BADGES: EnhancedBadge[] = [
  {
    id: 'night_owl', name: 'Night Owl', description: 'You find focus in the quiet hours after midnight',
    icon: '🦉', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'The night is your sanctuary!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#2F4F4F', secondaryColor: '#708090', gradient: ['#2F4F4F', '#708090'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#2F4F4F', shadowIntensity: 0.5, iconSymbol: '🦉' },
    unlockCriteria: { type: 'focus_sessions_after_midnight', value: 5 }
  },
  {
    id: 'early_bird', name: 'Early Bird', description: 'You catch the worm with dawn productivity',
    icon: '🐦', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'The early bird catches the worm!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FFA500', gradient: ['#FFD700', '#FFA500'],
      shape: 'circle', borderColor: '#DAA520', glowColor: '#FFD700', shadowIntensity: 0.5, iconSymbol: '🐦' },
    unlockCriteria: { type: 'focus_sessions_before_7am', value: 10 }
  },
  {
    id: 'weekend_warrior', name: 'Weekend Warrior', description: 'You maintain momentum even on weekends',
    icon: '⚔️', category: 'special', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your dedication knows no weekends!', celebrationEffect: 'bounce',
    visualDesign: { primaryColor: '#8B4513', secondaryColor: '#CD853F', gradient: ['#8B4513', '#CD853F'],
      shape: 'shield', borderColor: '#C0C0C0', glowColor: '#8B4513', shadowIntensity: 0.4, iconSymbol: '⚔️' },
    unlockCriteria: { type: 'weekend_activities', value: 8 }
  },
  {
    id: 'perfectionist', name: 'Perfectionist', description: 'You completed a full week without missing any habits',
    icon: '💎', category: 'special', tier: 'diamond', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'Perfection achieved through dedication!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#E0E0E0', secondaryColor: '#FFFFFF', gradient: ['#E0E0E0', '#FFFFFF'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#E0E0E0', shadowIntensity: 0.7, iconSymbol: '💎' },
    unlockCriteria: { type: 'perfect_week', value: 1 }
  }
];

// SEASONAL BADGES
export const SEASONAL_BADGES: EnhancedBadge[] = [
  {
    id: 'new_year_resolver', name: 'New Year Resolver', description: 'You started the year with determination',
    icon: '🎊', category: 'seasonal', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'New year, new focused you!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FF69B4', gradient: ['#FFD700', '#FF69B4'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FFD700', shadowIntensity: 0.5, iconSymbol: '🎊' },
    unlockCriteria: { type: 'january_streak', value: 7 }
  },
  {
    id: 'spring_awakening', name: 'Spring Awakening', description: 'You bloomed with productivity as nature awakened',
    icon: '🌸', category: 'seasonal', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'You\'ve awakened with the spring!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FFB6C1', secondaryColor: '#FFC0CB', gradient: ['#FFB6C1', '#FFC0CB'],
      shape: 'circle', borderColor: '#C0C0C0', glowColor: '#FFB6C1', shadowIntensity: 0.4, iconSymbol: '🌸' },
    unlockCriteria: { type: 'spring_activities', value: 30 }
  }
];

// PRODUCTIVITY MASTERY BADGES
export const PRODUCTIVITY_BADGES: EnhancedBadge[] = [
  {
    id: 'time_lord', name: 'Time Lord', description: 'Master of time management and scheduling',
    icon: '⏰', category: 'special', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'You have mastered the flow of time!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FF6B35', secondaryColor: '#FFD700', gradient: ['#FF6B35', '#FFD700'],
      shape: 'hexagon', borderColor: '#DAA520', glowColor: '#FF6B35', shadowIntensity: 0.5, iconSymbol: '⏰' },
    unlockCriteria: { type: 'daily_planning_streak', value: 14 }
  },
  {
    id: 'zen_master', name: 'Zen Master', description: 'Found inner peace through mindful productivity',
    icon: '🧘', category: 'special', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'Inner peace achieved through mindful work!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#9370DB', secondaryColor: '#DDA0DD', gradient: ['#9370DB', '#DDA0DD'],
      shape: 'circle', borderColor: '#4B0082', glowColor: '#9370DB', shadowIntensity: 0.7, iconSymbol: '🧘' },
    unlockCriteria: { type: 'meditation_sessions', value: 30 }
  },
  {
    id: 'task_crusher', name: 'Task Crusher', description: 'Demolished your to-do list with ruthless efficiency',
    icon: '💪', category: 'special', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'No task can stand against your might!', celebrationEffect: 'bounce',
    visualDesign: { primaryColor: '#FF4500', secondaryColor: '#FF8C00', gradient: ['#FF4500', '#FF8C00'],
      shape: 'shield', borderColor: '#C0C0C0', glowColor: '#FF4500', shadowIntensity: 0.4, iconSymbol: '💪' },
    unlockCriteria: { type: 'tasks_completed_single_day', value: 20 }
  },
  {
    id: 'efficiency_expert', name: 'Efficiency Expert', description: 'Optimized your workflow to perfection',
    icon: '⚡', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Maximum efficiency achieved!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FFA500', gradient: ['#FFD700', '#FFA500'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FFD700', shadowIntensity: 0.5, iconSymbol: '⚡' },
    unlockCriteria: { type: 'average_session_efficiency', value: 90 }
  },
  {
    id: 'flow_state', name: 'Flow State', description: 'Entered the legendary zone of peak performance',
    icon: '🌊', category: 'focus', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'You have entered the flow!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#4682B4', secondaryColor: '#87CEEB', gradient: ['#4682B4', '#87CEEB'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#4682B4', shadowIntensity: 0.7, iconSymbol: '🌊' },
    unlockCriteria: { type: 'consecutive_focus_hours', value: 6 }
  }
];

// WELLNESS & BALANCE BADGES
export const WELLNESS_BADGES: EnhancedBadge[] = [
  {
    id: 'wellness_warrior', name: 'Wellness Warrior', description: 'Balanced productivity with self-care',
    icon: '🌱', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Balance is the key to sustainable success!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#32CD32', secondaryColor: '#90EE90', gradient: ['#32CD32', '#90EE90'],
      shape: 'circle', borderColor: '#DAA520', glowColor: '#32CD32', shadowIntensity: 0.5, iconSymbol: '🌱' },
    unlockCriteria: { type: 'wellness_activities', value: 50 }
  },
  {
    id: 'sleep_champion', name: 'Sleep Champion', description: 'Maintained healthy sleep patterns for peak performance',
    icon: '😴', category: 'special', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Rest is the foundation of greatness!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#4B0082', secondaryColor: '#9370DB', gradient: ['#4B0082', '#9370DB'],
      shape: 'circle', borderColor: '#C0C0C0', glowColor: '#4B0082', shadowIntensity: 0.4, iconSymbol: '😴' },
    unlockCriteria: { type: 'consistent_sleep_schedule', value: 21 }
  },
  {
    id: 'hydration_hero', name: 'Hydration Hero', description: 'Kept your brain fueled with proper hydration',
    icon: '💧', category: 'special', tier: 'bronze', rarity: 'common', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your brain thanks you for the hydration!', celebrationEffect: 'bounce',
    visualDesign: { primaryColor: '#00BFFF', secondaryColor: '#87CEEB', gradient: ['#00BFFF', '#87CEEB'],
      shape: 'circle', borderColor: '#CD853F', glowColor: '#00BFFF', shadowIntensity: 0.3, iconSymbol: '💧' },
    unlockCriteria: { type: 'water_intake_goals', value: 30 }
  }
];

// CREATIVITY & INNOVATION BADGES
export const CREATIVITY_BADGES: EnhancedBadge[] = [
  {
    id: 'creative_genius', name: 'Creative Genius', description: 'Unleashed your creative potential',
    icon: '🎨', category: 'special', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'Your creativity knows no bounds!', celebrationEffect: 'confetti',
    visualDesign: { primaryColor: '#FF69B4', secondaryColor: '#FFB6C1', gradient: ['#FF69B4', '#FFB6C1'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FF69B4', shadowIntensity: 0.5, iconSymbol: '🎨' },
    unlockCriteria: { type: 'creative_sessions', value: 25 }
  },
  {
    id: 'innovation_pioneer', name: 'Innovation Pioneer', description: 'Pioneered new ways of thinking and working',
    icon: '💡', category: 'special', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'Innovation is your superpower!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FFA500', gradient: ['#FFD700', '#FFA500'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#FFD700', shadowIntensity: 0.7, iconSymbol: '💡' },
    unlockCriteria: { type: 'breakthrough_moments', value: 10 }
  },
  {
    id: 'problem_solver', name: 'Problem Solver', description: 'Tackled complex challenges with determination',
    icon: '🧩', category: 'special', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'No problem is too complex for you!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#9932CC', secondaryColor: '#DA70D6', gradient: ['#9932CC', '#DA70D6'],
      shape: 'hexagon', borderColor: '#C0C0C0', glowColor: '#9932CC', shadowIntensity: 0.4, iconSymbol: '🧩' },
    unlockCriteria: { type: 'complex_tasks_completed', value: 15 }
  }
];

// SOCIAL & COLLABORATION BADGES
export const SOCIAL_BADGES: EnhancedBadge[] = [
  {
    id: 'team_player', name: 'Team Player', description: 'Excelled in collaborative environments',
    icon: '🤝', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Together we achieve more!', celebrationEffect: 'confetti',
    visualDesign: { primaryColor: '#32CD32', secondaryColor: '#90EE90', gradient: ['#32CD32', '#90EE90'],
      shape: 'shield', borderColor: '#DAA520', glowColor: '#32CD32', shadowIntensity: 0.5, iconSymbol: '🤝' },
    unlockCriteria: { type: 'collaborative_sessions', value: 20 }
  },
  {
    id: 'mentor', name: 'Mentor', description: 'Guided others on their productivity journey',
    icon: '👨‍🏫', category: 'special', tier: 'diamond', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'Teaching others multiplies your impact!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#4169E1', secondaryColor: '#87CEEB', gradient: ['#4169E1', '#87CEEB'],
      shape: 'star', borderColor: '#4B0082', glowColor: '#4169E1', shadowIntensity: 0.7, iconSymbol: '👨‍🏫' },
    unlockCriteria: { type: 'mentoring_sessions', value: 10 }
  },
  {
    id: 'community_builder', name: 'Community Builder', description: 'Built connections and fostered growth',
    icon: '🏘️', category: 'special', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'You build bridges that connect hearts!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#FF6347', secondaryColor: '#FFB347', gradient: ['#FF6347', '#FFB347'],
      shape: 'hexagon', borderColor: '#DAA520', glowColor: '#FF6347', shadowIntensity: 0.5, iconSymbol: '🏘️' },
    unlockCriteria: { type: 'community_interactions', value: 100 }
  }
];

// ACHIEVEMENT MILESTONES
export const MILESTONE_BADGES: EnhancedBadge[] = [
  {
    id: 'century_club', name: 'Century Club', description: 'Completed 100 focus sessions',
    icon: '💯', category: 'focus', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: false,
    unlockMessage: 'Welcome to the exclusive Century Club!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FFA500', gradient: ['#FFD700', '#FFA500'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#FFD700', shadowIntensity: 0.5, iconSymbol: '💯' },
    unlockCriteria: { type: 'focus_sessions_completed', value: 100 }
  },
  {
    id: 'habit_architect', name: 'Habit Architect', description: 'Designed and built 10 lasting habits',
    icon: '🏗️', category: 'habit', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'You are the architect of your destiny!', celebrationEffect: 'confetti',
    visualDesign: { primaryColor: '#8B4513', secondaryColor: '#CD853F', gradient: ['#8B4513', '#CD853F'],
      shape: 'shield', borderColor: '#DAA520', glowColor: '#8B4513', shadowIntensity: 0.5, iconSymbol: '🏗️' },
    unlockCriteria: { type: 'habits_created', value: 10 }
  },
  {
    id: 'consistency_king', name: 'Consistency King', description: 'Maintained habits for 365 days straight',
    icon: '👑', category: 'streak', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: false,
    unlockMessage: 'You wear the crown of consistency!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FF6347', gradient: ['#FFD700', '#FF6347'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#FFD700', shadowIntensity: 0.7, iconSymbol: '👑' },
    unlockCriteria: { type: 'daily_streak', value: 365 }
  },
  {
    id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Dedicated time to learning and growth',
    icon: '📚', category: 'special', tier: 'silver', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Knowledge is the greatest treasure!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#4169E1', secondaryColor: '#87CEEB', gradient: ['#4169E1', '#87CEEB'],
      shape: 'circle', borderColor: '#C0C0C0', glowColor: '#4169E1', shadowIntensity: 0.4, iconSymbol: '📚' },
    unlockCriteria: { type: 'learning_sessions', value: 40 }
  },
  {
    id: 'reflection_master', name: 'Reflection Master', description: 'Mastered the art of self-reflection',
    icon: '🪞', category: 'special', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: false,
    unlockMessage: 'Self-awareness is your greatest strength!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#9370DB', secondaryColor: '#DDA0DD', gradient: ['#9370DB', '#DDA0DD'],
      shape: 'circle', borderColor: '#DAA520', glowColor: '#9370DB', shadowIntensity: 0.5, iconSymbol: '🪞' },
    unlockCriteria: { type: 'reflection_entries', value: 50 }
  }
];

// HIDDEN BADGES
export const HIDDEN_BADGES: EnhancedBadge[] = [
  {
    id: 'truth_seeker', name: 'Truth Seeker', description: 'You discovered the deeper meaning behind Veritas',
    icon: '🔍', category: 'hidden', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: true,
    unlockMessage: 'You have found the truth within!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#4B0082', secondaryColor: '#9370DB', gradient: ['#4B0082', '#9370DB'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#4B0082', shadowIntensity: 0.7, iconSymbol: '🔍' },
    unlockCriteria: { type: 'journal_entries_with_keyword', value: 5, additionalConditions: { keyword: 'truth' } }
  },
  {
    id: 'phoenix_rising', name: 'Phoenix Rising', description: 'You rose from the ashes of a broken streak',
    icon: '🔥', category: 'hidden', tier: 'gold', rarity: 'epic', isUnlocked: false, isHidden: true,
    unlockMessage: 'From ashes, you rise stronger!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#DC143C', secondaryColor: '#FF4500', gradient: ['#DC143C', '#FF4500'],
      shape: 'star', borderColor: '#DAA520', glowColor: '#DC143C', shadowIntensity: 0.5, iconSymbol: '🔥' },
    unlockCriteria: { type: 'streak_recovery', value: 1 }
  },
  {
    id: 'midnight_scholar', name: 'Midnight Scholar', description: 'Found wisdom in the quiet hours of night',
    icon: '🌙', category: 'hidden', tier: 'silver', rarity: 'epic', isUnlocked: false, isHidden: true,
    unlockMessage: 'The night reveals its secrets to you!', celebrationEffect: 'glow',
    visualDesign: { primaryColor: '#2F4F4F', secondaryColor: '#708090', gradient: ['#2F4F4F', '#708090'],
      shape: 'circle', borderColor: '#C0C0C0', glowColor: '#2F4F4F', shadowIntensity: 0.4, iconSymbol: '🌙' },
    unlockCriteria: { type: 'late_night_sessions', value: 20 }
  },
  {
    id: 'digital_detox', name: 'Digital Detox', description: 'Mastered the art of disconnecting to reconnect',
    icon: '📵', category: 'hidden', tier: 'gold', rarity: 'rare', isUnlocked: false, isHidden: true,
    unlockMessage: 'True connection comes from disconnection!', celebrationEffect: 'sparkles',
    visualDesign: { primaryColor: '#32CD32', secondaryColor: '#90EE90', gradient: ['#32CD32', '#90EE90'],
      shape: 'shield', borderColor: '#DAA520', glowColor: '#32CD32', shadowIntensity: 0.5, iconSymbol: '📵' },
    unlockCriteria: { type: 'offline_focus_sessions', value: 15 }
  },
  {
    id: 'secret_keeper', name: 'Secret Keeper', description: 'Unlocked the hidden potential within',
    icon: '🗝️', category: 'hidden', tier: 'diamond', rarity: 'legendary', isUnlocked: false, isHidden: true,
    unlockMessage: 'You hold the key to infinite possibilities!', celebrationEffect: 'fireworks',
    visualDesign: { primaryColor: '#FFD700', secondaryColor: '#FFA500', gradient: ['#FFD700', '#FFA500'],
      shape: 'diamond', borderColor: '#4B0082', glowColor: '#FFD700', shadowIntensity: 0.7, iconSymbol: '🗝️' },
    unlockCriteria: { type: 'all_categories_mastered', value: 1 }
  }
];

// Combine all badges
export const ALL_BADGES: EnhancedBadge[] = [
  ...STREAK_BADGES,
  ...FOCUS_BADGES,
  ...HABIT_BADGES,
  ...SPECIAL_BADGES,
  ...SEASONAL_BADGES,
  ...PRODUCTIVITY_BADGES,
  ...WELLNESS_BADGES,
  ...CREATIVITY_BADGES,
  ...SOCIAL_BADGES,
  ...MILESTONE_BADGES,
  ...HIDDEN_BADGES
];

// Badge unlock checking function
export const checkEnhancedBadgeUnlocks = (
  badges: EnhancedBadge[],
  stats: GamificationState['stats'],
  streakCount: number,
  focusSessions: any[],
  habits: any[],
  journalEntries: any[]
): EnhancedBadge[] => {
  return badges.map(badge => {
    if (badge.isUnlocked) return badge;

    let shouldUnlock = false;
    const { type, value, additionalConditions } = badge.unlockCriteria;

    switch (type) {
      case 'daily_streak':
        shouldUnlock = streakCount >= value;
        break;
      case 'total_focus_hours':
        shouldUnlock = stats.totalFocusHours >= value;
        break;
      case 'focus_sessions_completed':
        shouldUnlock = focusSessions.length >= value;
        break;
      case 'habits_completed':
        shouldUnlock = stats.totalHabitsCompleted >= value;
        break;
      case 'focus_sessions_after_midnight':
        const midnightSessions = focusSessions.filter(session => {
          const hour = new Date(session.startTime).getHours();
          return hour >= 0 && hour < 6;
        });
        shouldUnlock = midnightSessions.length >= value;
        break;
      case 'focus_sessions_before_7am':
        const earlySessions = focusSessions.filter(session => {
          const hour = new Date(session.startTime).getHours();
          return hour >= 5 && hour < 7;
        });
        shouldUnlock = earlySessions.length >= value;
        break;
      case 'weekend_activities':
        const weekendSessions = focusSessions.filter(session => {
          const day = new Date(session.startTime).getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
        shouldUnlock = weekendSessions.length >= value;
        break;
      case 'daily_focus_hours':
        if (additionalConditions?.singleDay) {
          const dailyHours = focusSessions.reduce((acc, session) => {
            const date = new Date(session.startTime).toDateString();
            acc[date] = (acc[date] || 0) + (session.actualDuration / 60);
            return acc;
          }, {});
          shouldUnlock = Object.values(dailyHours).some((hours: any) => hours >= value);
        }
        break;
      case 'perfect_week':
        // Check for a perfect week of habit completion
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekHabits = habits.filter((habit: any) => 
          habit.history.some((entry: any) => 
            new Date(entry.date) >= weekAgo && entry.completed
          )
        );
        shouldUnlock = weekHabits.length === habits.length && habits.length > 0;
        break;
      case 'journal_entries_with_keyword':
        if (additionalConditions?.keyword) {
          const keywordEntries = journalEntries.filter((entry: any) => 
            entry.q1.toLowerCase().includes(additionalConditions.keyword.toLowerCase()) ||
            entry.q2.toLowerCase().includes(additionalConditions.keyword.toLowerCase()) ||
            entry.q3.toLowerCase().includes(additionalConditions.keyword.toLowerCase())
          );
          shouldUnlock = keywordEntries.length >= value;
        }
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
