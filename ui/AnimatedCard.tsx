import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/context/ThemeContext';
import { cardSurface } from './themeStyles';

interface AnimatedCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, style, delay = 0 }) => {
  const { theme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -10 }}
      transition={{ type: 'timing', duration: 350, delay }}
      style={[cardSurface(theme), style]}
    >
      {children}
    </MotiView>
  );
};

export const AnimatedRow: React.FC<AnimatedCardProps> = ({ children, style, delay = 0 }) => (
  <MotiView
    from={{ opacity: 0, translateY: 6 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 300, delay }}
    style={style}
  >
    {children}
  </MotiView>
);
