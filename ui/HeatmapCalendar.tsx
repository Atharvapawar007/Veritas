import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';

interface HeatmapDay {
  date: Date;
  hours: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface HeatmapCalendarProps {
  focusSessions: any[];
  currentDate?: Date;
}

// Helper function to get heatmap color based on hours
const getHeatmapColor = (hours: number, maxHours: number, isDark: boolean) => {
  if (hours === 0) {
    return isDark ? '#2C2C2E' : '#E0E0E0';
  }
  
  const intensity = Math.min(hours / Math.max(maxHours, 5), 1); // Cap at 5 hours for max intensity
  
  if (intensity <= 0.2) return '#C6F6D5';
  if (intensity <= 0.4) return '#68D391';
  if (intensity <= 0.7) return '#38A169';
  return '#22543D';
};

// Helper function to get hours for a specific date
const getHoursForDate = (date: Date, focusSessions: any[]) => {
  const dateStr = date.toISOString().split('T')[0];
  const sessionsForDate = focusSessions.filter(session => {
    const sessionDate = new Date(session.date).toISOString().split('T')[0];
    return sessionDate === dateStr;
  });
  
  return sessionsForDate.reduce((total, session) => total + (session.duration / 60), 0); // Convert minutes to hours
};

// Helper function to generate calendar grid
const generateCalendarGrid = (currentDate: Date, focusSessions: any[]): HeatmapDay[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get first day of the week (Sunday = 0)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Get last day of the week
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
  
  const days: HeatmapDay[] = [];
  const current = new Date(startDate);
  const today = new Date();
  
  while (current <= endDate) {
    const isCurrentMonth = current.getMonth() === month;
    const isToday = current.toDateString() === today.toDateString();
    const hours = getHoursForDate(current, focusSessions);
    
    days.push({
      date: new Date(current),
      hours,
      isCurrentMonth,
      isToday,
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  focusSessions,
  currentDate = new Date(),
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  
  const days = generateCalendarGrid(selectedDate, focusSessions);
  const maxHours = Math.max(...days.map(day => day.hours), 1);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };
  
  const handleDayPress = (day: HeatmapDay) => {
    setSelectedDay(day);
    setModalVisible(true);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getGoalProgress = (hours: number) => {
    const dailyGoal = 2; // Assuming 2 hours daily goal
    if (hours >= dailyGoal) {
      return `✅ Goal achieved! (+${(hours - dailyGoal).toFixed(1)}h extra)`;
    } else if (hours > 0) {
      return `📈 ${(hours / dailyGoal * 100).toFixed(0)}% of daily goal`;
    }
    return '❌ No deep work logged';
  };
  
  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Split days into weeks
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Weekday headers */}
      <View style={styles.weekdayHeader}>
        {weekdays.map((day) => (
          <Text key={day} style={[styles.weekdayText, { color: theme.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: getHeatmapColor(day.hours, maxHours, theme.isDark),
                    borderColor: day.isToday 
                      ? theme.blue 
                      : (theme.isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.18)'),
                    borderWidth: day.isToday ? 2 : 1,
                    opacity: day.isCurrentMonth ? 1 : 0.4,
                  },
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: day.hours > 0 ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: day.isToday ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {day.date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.textSecondary }]}>Less</Text>
        <View style={styles.legendColors}>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[
                styles.legendSquare,
                { backgroundColor: getHeatmapColor(level * 1.25, 5, theme.isDark) },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.legendText, { color: theme.textSecondary }]}>More</Text>
      </View>
      
      {/* Day detail modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            {selectedDay && (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                
                <View style={[
                  styles.modalDateSquare,
                  { 
                    backgroundColor: getHeatmapColor(selectedDay.hours, maxHours, theme.isDark),
                    borderColor: selectedDay.isToday 
                      ? theme.blue 
                      : (theme.isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.18)'),
                    borderWidth: selectedDay.isToday ? 2 : 1,
                  }
                ]}>
                  <Text style={[styles.modalDateNumber, { color: selectedDay.hours > 0 ? '#FFFFFF' : theme.textSecondary }]}>
                    {selectedDay.date.getDate()}
                  </Text>
                </View>
                
                <Text style={[styles.modalDate, { color: theme.textPrimary }]}>
                  {formatDate(selectedDay.date)}
                </Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: theme.blue }]}>
                      {selectedDay.hours.toFixed(1)}h
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: theme.textSecondary }]}>
                      Deep Work
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.modalGoalText, { color: theme.textSecondary }]}>
                  {getGoalProgress(selectedDay.hours)}
                </Text>
              </>
            )}
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
  calendarGrid: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 1.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  dayNumber: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    marginHorizontal: 8,
  },
  legendColors: {
    flexDirection: 'row',
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDateSquare: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  modalDateNumber: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
  },
  modalDate: {
    fontSize: 18,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalStatItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  modalStatValue: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
  },
  modalStatLabel: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    marginTop: 4,
  },
  modalGoalText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    textAlign: 'center',
  },
});
