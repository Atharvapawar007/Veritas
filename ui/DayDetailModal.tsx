import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { CalendarDay, DayData, calculateProgress, formatDate, formatMinutes } from '../utils/calendarUtils';

interface DayDetailModalProps {
  visible: boolean;
  day: CalendarDay | null;
  data: DayData | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  visible,
  day,
  data,
  onClose,
}) => {
  if (!day) return null;

  const progress = data 
    ? calculateProgress(data.goal, data.used)
    : { percentage: 0, color: '#6C6C70', status: 'none' as const };

  const remaining = data ? Math.max(0, data.goal - data.used) : 0;
  const over = data ? Math.max(0, data.used - data.goal) : 0;

  // Large progress ring dimensions
  const ringSize = 120;
  const radius = (ringSize - 8) / 2;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
          
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Handle bar */}
              <View style={styles.handleBar} />
              
              {/* Date header */}
              <Text style={styles.dateText}>
                {formatDate(day.date)}
              </Text>
              
              {/* Large progress ring */}
              <View style={styles.progressContainer}>
                <Svg width={ringSize} height={ringSize}>
                  {/* Background ring */}
                  <Circle
                    stroke="#2C2C2E"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                  />
                  {/* Progress ring */}
                  {progress.percentage > 0 && (
                    <Circle
                      stroke={progress.color}
                      fill="transparent"
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                    />
                  )}
                </Svg>
                
                {/* Center text */}
                <View style={styles.centerText}>
                  <Text style={styles.percentageText}>
                    {Math.round(progress.percentage)}%
                  </Text>
                  <Text style={styles.statusText}>
                    {progress.status === 'over' ? 'Over Goal' : 
                     progress.status === 'within' ? 'On Track' : 'No Data'}
                  </Text>
                </View>
              </View>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Goal</Text>
                  <Text style={styles.statValue}>
                    {data ? formatMinutes(data.goal) : '0m'}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Used</Text>
                  <Text style={[styles.statValue, { color: progress.color }]}>
                    {data ? formatMinutes(data.used) : '0m'}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {progress.status === 'over' ? 'Over' : 'Remaining'}
                  </Text>
                  <Text style={[
                    styles.statValue,
                    { color: progress.status === 'over' ? '#FF453A' : '#30D158' }
                  ]}>
                    {progress.status === 'over' 
                      ? formatMinutes(over)
                      : formatMinutes(remaining)
                    }
                  </Text>
                </View>
              </View>
              
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: height * 0.5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#6C6C70',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusText: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 14,
    fontWeight: '500',
    color: '#A9A9AA',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 14,
    fontWeight: '500',
    color: '#A9A9AA',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButtonText: {
    fontFamily: 'SF Pro Display Bold',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
