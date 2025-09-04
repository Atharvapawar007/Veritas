import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Dimensions, FlatList, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { AnimatedCard } from '@/ui/AnimatedCard';
import { HeatmapCalendar } from '@/ui/HeatmapCalendar';
import { LineChart } from '@/ui/LineChart';
import { ALL_BADGES, EnhancedBadge, checkEnhancedBadgeUnlocks } from '@/services/badges';

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { state } = useAppContext();
  const { theme } = useTheme();
  const streakAnimation = useRef(new Animated.Value(1)).current;
  const [selectedBadge, setSelectedBadge] = useState<EnhancedBadge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Focus sessions this week
    const weekSessions = state.focusSessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const totalFocusMinutes = weekSessions.reduce((sum, session) => sum + session.actualDuration, 0);
    const focusSessionsCompleted = weekSessions.length;

    // Today's focus time
    const today = new Date().toISOString().split('T')[0];
    const todayFocusMinutes = state.focusSessions
      .filter((session: any) => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        return sessionDate === today;
      })
      .reduce((sum, session) => sum + session.actualDuration, 0);

    // Habit success rate this week
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    let totalHabitOpportunities = 0;
    let completedHabitDays = 0;

    state.habits.forEach(habit => {
      weekDates.forEach(date => {
        const habitEntry = habit.history.find(entry => entry.date === date);
        totalHabitOpportunities++;
        if (habitEntry && habitEntry.completed) {
          completedHabitDays++;
        }
      });
    });

    const habitSuccessPercentage = totalHabitOpportunities > 0 
      ? Math.round((completedHabitDays / totalHabitOpportunities) * 100)
      : 0;

    // Longest streak
    const longestStreak = state.habits.reduce((max, habit) => 
      Math.max(max, habit.streak), 0
    );

    return {
      totalFocusMinutes,
      todayFocusMinutes,
      focusSessionsCompleted,
      habitSuccessPercentage,
      longestStreak,
      weekStartDate: weekStart.toISOString().split('T')[0],
    };
  };

  const stats = getWeeklyStats();

  // Animate streak when it's a new record
  useEffect(() => {
    if (stats.longestStreak > 0) {
      Animated.sequence([
        Animated.timing(streakAnimation, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [stats.longestStreak]);

  // Get weekly trend data for charts
  const getWeeklyTrendData = () => {
    const now = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayFocusMinutes = state.focusSessions
        .filter((session: any) => {
          const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
          return sessionDate === dateStr;
        })
        .reduce((sum, session) => sum + session.actualDuration, 0);
      
      const habitsCompleted = state.habits.filter((habit: any) => {
        const entry = habit.history.find((h: any) => h.date === dateStr);
        return entry && entry.completed;
      }).length;
      
      days.push({
        date: dateStr,
        focusMinutes: dayFocusMinutes,
        habitsCompleted,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const weeklyTrend = getWeeklyTrendData();


  // Get badges with unlock status
  const getBadgesWithStatus = () => {
    const longestStreak = state.habits.reduce((max, habit) => 
      Math.max(max, habit.streak), 0
    );
    
    return checkEnhancedBadgeUnlocks(
      ALL_BADGES,
      state.gamification?.stats || { totalFocusHours: 0, totalHabitsCompleted: 0 },
      longestStreak,
      state.focusSessions || [],
      state.habits || [],
      state.journalEntries || []
    );
  };

  const badges = getBadgesWithStatus();
  const unlockedBadges = badges.filter(badge => badge.isUnlocked).sort((a, b) => 
    new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime()
  );
  const lockedBadges = badges.filter(badge => !badge.isUnlocked && !badge.isHidden);
  const sortedBadges = [...unlockedBadges, ...lockedBadges];

  const handleBadgePress = (badge: EnhancedBadge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const renderBadgeTile = ({ item: badge }: { item: EnhancedBadge }) => {
    return (
      <TouchableOpacity
        onPress={() => handleBadgePress(badge)}
        activeOpacity={0.7}
        style={styles.badgeTileContainer}
      >
        <View style={[
          styles.badgeTile,
          {
            backgroundColor: theme.cardBackground,
            borderColor: badge.isUnlocked 
              ? badge.visualDesign.borderColor 
              : theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            opacity: badge.isUnlocked ? 1 : 0.6,
          },
          badge.isUnlocked && {
            shadowColor: badge.visualDesign.glowColor,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }
        ]}>
          <View style={[
            styles.tileIconContainer,
            {
              backgroundColor: badge.isUnlocked 
                ? `${badge.visualDesign.primaryColor}20`
                : theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }
          ]}>
            <Text style={[
              styles.tileIcon,
              { opacity: badge.isUnlocked ? 1 : 0.4 }
            ]}>
              {badge.icon}
            </Text>
            {badge.isUnlocked && (
              <View style={[
                styles.tileUnlockedIndicator,
                { backgroundColor: badge.visualDesign.primaryColor }
              ]}>
                <Ionicons name="checkmark" size={8} color="white" />
              </View>
            )}
            {!badge.isUnlocked && (
              <View style={styles.tileLockedIndicator}>
                <Ionicons name="lock-closed" size={8} color={theme.textSecondary} />
              </View>
            )}
          </View>
          
          <Text style={[
            styles.tileTitle,
            { 
              color: badge.isUnlocked ? theme.textPrimary : theme.textSecondary,
              opacity: badge.isUnlocked ? 1 : 0.7
            }
          ]}>
            {badge.name}
          </Text>
          
          {badge.rarity !== 'common' && (
            <View style={[
              styles.tileRarityBadge,
              { backgroundColor: getRarityColor(badge.rarity) }
            ]}>
              <Text style={styles.tileRarityText}>
                {badge.rarity.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return '#4169E1';
      case 'epic': return '#9932CC';
      case 'legendary': return '#FFD700';
      default: return '#808080';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your Progress Overview</Text>
        </View>

        {/* Horizontal Scroll Stat Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalStats}
          style={styles.horizontalScrollContainer}
        >
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={styles.compactStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="timer-outline" size={24} color={theme.blue} />
            <Text style={[styles.compactStatNumber, { color: theme.textPrimary }]}>{formatTime(stats.todayFocusMinutes)}</Text>
            <Text style={[styles.compactStatLabel, { color: theme.textSecondary }]}>Today's Focus</Text>
          </LinearGradient>

          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={styles.compactStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={{ transform: [{ scale: streakAnimation }] }}>
              <Ionicons name="flame" size={24} color={theme.pink} />
            </Animated.View>
            <Animated.Text style={[styles.compactStatNumber, { color: theme.textPrimary, transform: [{ scale: streakAnimation }] }]}>
              {stats.longestStreak}
            </Animated.Text>
            <Text style={[styles.compactStatLabel, { color: theme.textSecondary }]}>Best Streak</Text>
            {stats.longestStreak >= 7 && (
              <Text style={[styles.streakBadge, { color: theme.pink }]}>🔥 On Fire!</Text>
            )}
          </LinearGradient>

          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={styles.compactStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.green} />
            <Text style={[styles.compactStatNumber, { color: theme.textPrimary }]}>{stats.habitSuccessPercentage}%</Text>
            <Text style={[styles.compactStatLabel, { color: theme.textSecondary }]}>Habit Success</Text>
          </LinearGradient>

          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
            style={styles.compactStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="play-circle-outline" size={24} color={theme.teal} />
            <Text style={[styles.compactStatNumber, { color: theme.textPrimary }]}>{stats.focusSessionsCompleted}</Text>
            <Text style={[styles.compactStatLabel, { color: theme.textSecondary }]}>Sessions</Text>
          </LinearGradient>
        </ScrollView>

        {/* Weekly Progress Chart */}
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
          style={styles.chartSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Focus Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart 
              data={weeklyTrend.map(d => d.focusMinutes)} 
              width={screenWidth - 96} 
              height={120} 
              color={theme.blue}
            />
          </View>
          <View style={styles.trendInsight}>
            <Text style={[styles.trendText, { color: theme.textSecondary }]}>
              {weeklyTrend[weeklyTrend.length - 1].focusMinutes > weeklyTrend[weeklyTrend.length - 2].focusMinutes 
                ? "📈 You're ahead of yesterday!" 
                : "💪 Keep building momentum"}
            </Text>
          </View>
        </LinearGradient>

        {/* Deep Work Heatmap Calendar */}
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
          style={styles.calendarCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Deep Work Calendar</Text>
          <HeatmapCalendar 
            focusSessions={state.focusSessions || []}
          />
        </LinearGradient>

        {/* Weekly Trend Chart */}
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
          style={styles.trendCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Weekly Progress</Text>
          <View style={styles.weeklyStatsContainer}>
            {weeklyTrend.slice(-7).map((day, index) => (
              <View key={index} style={styles.dayStatColumn}>
                <View style={[
                  styles.dayStatBar,
                  {
                    height: Math.max((day.focusMinutes / Math.max(...weeklyTrend.map(d => d.focusMinutes), 1)) * 60, 4),
                    backgroundColor: theme.blue,
                  }
                ]} />
                <Text style={[styles.dayStatLabel, { color: theme.textSecondary }]}>
                  {day.dayName}
                </Text>
                <Text style={[styles.dayStatValue, { color: theme.textPrimary }]}>
                  {Math.round(day.focusMinutes)}m
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.trendInsight}>
            <Text style={[styles.trendText, { color: theme.textSecondary }]}>
              {weeklyTrend[weeklyTrend.length - 1].focusMinutes > weeklyTrend[weeklyTrend.length - 2].focusMinutes 
                ? "📈 You're ahead of yesterday!" 
                : "💪 Keep building momentum"}
            </Text>
          </View>
        </LinearGradient>

        {/* Badges & Achievements Section */}
        <View style={styles.badgesSection}>
          <View style={styles.badgesSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Badges & Achievements</Text>
            <View style={styles.progressCounter}>
              <Text style={[styles.progressText, { color: theme.textPrimary }]}>🎉 </Text>
              <Text style={[styles.progressText, { color: theme.textPrimary }]}>
                {unlockedBadges.length} / {badges.filter(b => !b.isHidden).length} Badges Unlocked
              </Text>
            </View>
          </View>
          
          <FlatList
            data={sortedBadges}
            renderItem={renderBadgeTile}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.badgesList}
            scrollEnabled={false}
            columnWrapperStyle={styles.badgeRow}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, paddingHorizontal: 24 }]}>Insights</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalInsights}
            style={styles.horizontalScrollContainer}
          >
            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
              style={styles.insightCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trending-up-outline" size={24} color={theme.blue} />
              <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Focus Performance</Text>
              <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                {stats.focusSessionsCompleted === 0 
                  ? "Start your first focus session to build momentum."
                  : stats.totalFocusMinutes >= 120
                  ? "🎯 Excellent! You're maintaining deep work habits."
                  : "💪 Try to reach 2+ hours of focused work this week."
                }
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
              style={styles.insightCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.green} />
              <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Habit Consistency</Text>
              <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                {stats.habitSuccessPercentage >= 80
                  ? "🌟 Outstanding consistency! Keep up the great work."
                  : stats.habitSuccessPercentage >= 60
                  ? "📈 Good progress. Focus on the habits you're missing."
                  : state.habits.length === 0
                  ? "🎯 Add some habits to start building better routines."
                  : "🔥 Small daily actions lead to big results. Stay consistent."
                }
              </Text>
            </LinearGradient>

            {stats.longestStreak > 0 && (
              <LinearGradient
                colors={[theme.cardGradientStart, theme.cardGradientEnd] as const}
                style={styles.insightCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="flame" size={24} color={theme.pink} />
                <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Streak Power</Text>
                <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                  {stats.longestStreak >= 7
                    ? `🔥 Amazing ${stats.longestStreak}-day streak! You're building lasting habits.`
                    : `💫 ${stats.longestStreak}-day streak is a great start. Keep going!`
                  }
                </Text>
              </LinearGradient>
            )}
          </ScrollView>
        </View>
        
        {/* Badge Detail Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground }
            ]}>
              {selectedBadge && (
                <>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.textPrimary} />
                  </TouchableOpacity>
                  
                  <View style={[
                    styles.modalBadgeIcon,
                    {
                      backgroundColor: selectedBadge.isUnlocked 
                        ? `${selectedBadge.visualDesign.primaryColor}20`
                        : theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }
                  ]}>
                    <Text style={styles.modalBadgeIconText}>
                      {selectedBadge.icon}
                    </Text>
                  </View>
                  
                  <Text style={[
                    styles.modalBadgeTitle,
                    { color: theme.textPrimary }
                  ]}>
                    {selectedBadge.name}
                  </Text>
                  
                  <Text style={[
                    styles.modalBadgeDescription,
                    { color: theme.textSecondary }
                  ]}>
                    {selectedBadge.description}
                  </Text>
                  
                  {selectedBadge.isUnlocked ? (
                    <View style={styles.modalStatusContainer}>
                      <View style={[
                        styles.modalStatusBadge,
                        { backgroundColor: selectedBadge.visualDesign.primaryColor }
                      ]}>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.modalStatusText}>Unlocked</Text>
                      </View>
                      {selectedBadge.unlockedAt && (
                        <Text style={[
                          styles.modalDateText,
                          { color: theme.textSecondary }
                        ]}>
                          Earned on {new Date(selectedBadge.unlockedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      )}
                      <Text style={[
                        styles.modalUnlockMessage,
                        { color: selectedBadge.visualDesign.primaryColor }
                      ]}>
                        "{selectedBadge.unlockMessage}"
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.modalStatusContainer}>
                      <View style={[
                        styles.modalStatusBadge,
                        { backgroundColor: theme.textSecondary }
                      ]}>
                        <Ionicons name="lock-closed" size={20} color="white" />
                        <Text style={styles.modalStatusText}>Locked</Text>
                      </View>
                      <Text style={[
                        styles.modalRequirementText,
                        { color: theme.textSecondary }
                      ]}>
                        Requirement: {getRequirementText(selectedBadge)}
                      </Text>
                    </View>
                  )}
                  
                  {selectedBadge.powerUp && (
                    <View style={[
                      styles.powerUpContainer,
                      { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                    ]}>
                      <Text style={[
                        styles.powerUpTitle,
                        { color: theme.textPrimary }
                      ]}>
                        💪 Power-Up Effect
                      </Text>
                      <Text style={[
                        styles.powerUpText,
                        { color: theme.textSecondary }
                      ]}>
                        {selectedBadge.powerUp.effect}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </BlurView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );

  function getRequirementText(badge: EnhancedBadge): string {
    const { type, value } = badge.unlockCriteria;
    switch (type) {
      case 'daily_streak': return `Maintain a ${value}-day streak`;
      case 'total_focus_hours': return `Complete ${value} hours of focus time`;
      case 'focus_sessions_completed': return `Complete ${value} focus sessions`;
      case 'habits_completed': return `Complete ${value} habits`;
      case 'focus_sessions_after_midnight': return `Complete ${value} focus sessions after midnight`;
      case 'focus_sessions_before_7am': return `Complete ${value} focus sessions before 7 AM`;
      case 'weekend_activities': return `Complete ${value} weekend activities`;
      case 'daily_focus_hours': return `Focus for ${value} hours in a single day`;
      case 'focus_daily_streak': return `Do at least one focus session each day for ${value} consecutive days`;
      case 'consecutive_focus_hours': return `Complete a single focus session of at least ${value} hours`;
      case 'journal_entries': return `Write ${value} journal entries`;
      case 'perfect_week': return 'Complete all habits on each of the last 7 days';
      default: return 'Complete the required action';
    }
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  subtitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  horizontalScrollContainer: {
    marginBottom: 20,
    overflow: 'visible',
  },
  horizontalStats: {
    paddingHorizontal: 24,
    gap: 16,
  },
  compactStatCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  compactStatNumber: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  compactStatLabel: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
  },
  streakBadge: {
    fontSize: 10,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 4,
  },
  chartSection: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trendInsight: {
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  calendarSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  splitSection: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  progressRingCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  barChartCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
  },
  barChartContainer: {
    alignItems: 'center',
  },
  insightsSection: {
    marginBottom: 16,
    paddingBottom: 20,
  },
  horizontalInsights: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 16,
  },
  insightCard: {
    width: 200,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    marginVertical: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    lineHeight: 20,
  },
  // Badges Section Styles
  badgesSection: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  badgesSectionHeader: {
    marginBottom: 16,
  },
  progressCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  badgesList: {
    paddingBottom: 8,
  },
  badgeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 28,
  },
  unlockedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    lineHeight: 18,
    marginBottom: 8,
  },
  badgeStatus: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    marginLeft: 6,
    marginRight: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'SF Pro Display Bold',
    color: 'white',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalBadgeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  modalBadgeIconText: {
    fontSize: 48,
  },
  modalBadgeTitle: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeDescription: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalStatusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  modalStatusText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: 'white',
    marginLeft: 8,
  },
  modalDateText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalUnlockMessage: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  modalRequirementText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  powerUpContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  powerUpTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  powerUpText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Badge Tile Styles
  badgeRow: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  badgeTileContainer: {
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '31%', // Ensures 3 columns with consistent spacing
  },
  badgeTile: {
    aspectRatio: 1,
    width: '100%',
    minHeight: 100,
    maxHeight: 120,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  tileIcon: {
    fontSize: 20,
  },
  tileUnlockedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLockedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  tileRarityBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileRarityText: {
    fontSize: 8,
    fontFamily: 'SF Pro Display Bold',
    color: 'white',
    fontWeight: 'bold',
  },
  // New Heatmap Calendar Styles
  calendarCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  trendCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  weeklyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  dayStatColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayStatBar: {
    width: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dayStatLabel: {
    fontSize: 10,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 4,
  },
  dayStatValue: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
});
