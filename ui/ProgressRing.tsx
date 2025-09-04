import React, { PropsWithChildren, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

export type ProgressRingProps = PropsWithChildren<{
  size: number; // total width/height of the ring
  strokeWidth: number; // thickness of the ring stroke
  progress: number; // 0-100
  color: string; // progress color
}>;

// Simple circular progress ring used across Home and Challenge cards
export default function ProgressRing({ size, strokeWidth, progress, color, children }: ProgressRingProps) {
  const { theme } = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress ?? 0));
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const dashOffset = useMemo(
    () => circumference - (clampedProgress / 100) * circumference,
    [circumference, clampedProgress]
  );

  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.isDark ? theme.tertiaryBackground : 'rgba(0,0,0,0.08)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc (rotated -90deg so it starts at top) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {/* Slot for inner content */}
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
