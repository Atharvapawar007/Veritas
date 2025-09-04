import { Theme } from '@/context/ThemeContext';
import { fontStyles } from './fonts';

// Enhanced neon border for dark mode, subtle for light mode
export const cardBorder = (theme: Theme) => ({
  borderWidth: theme.isDark ? 2 : 1,
  // Vibrant neon blue border in dark mode; subtle grey in light mode
  borderColor: theme.isDark ? theme.blue + 'E6' : theme.textSecondary + '26',
});

// Enhanced neon glow shadow for dark mode
export const cardShadow = (theme: Theme) => ({
  // Bright neon blue glow in dark mode, standard shadow in light mode
  shadowColor: theme.isDark ? theme.blue : '#000000',
  shadowOffset: { width: 0, height: theme.isDark ? 0 : 6 },
  shadowOpacity: theme.isDark ? 0.8 : 0.15,
  shadowRadius: theme.isDark ? 25 : 12,
  // Android fallback
  elevation: theme.isDark ? 15 : 3,
});

export const cardSurface = (theme: Theme) => ({
  backgroundColor: theme.cardBackground,
  borderRadius: 16,
  ...cardBorder(theme),
  ...cardShadow(theme),
  ...fontStyles.body,
});

export const chipBorder = (theme: Theme) => ({
  borderWidth: 1,
  borderColor: theme.primaryAccent + '33',
  borderRadius: 999,
});
