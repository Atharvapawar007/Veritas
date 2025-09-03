import { Theme } from '@/context/ThemeContext';
import { fontStyles } from './fonts';

// Thin, subtle iOS-like border using theme colors
export const cardBorder = (theme: Theme) => ({
  borderWidth: theme.isDark ? 1.75 : 1,
  // Brighter neon edge in dark mode using the accent; subtle grey in light mode
  borderColor: theme.isDark ? theme.primaryAccent + 'CC' : theme.textSecondary + '26',
});

// Soft iOS shadow with Android elevation fallback
export const cardShadow = (theme: Theme) => ({
  // In dark mode, create a soft neon glow using the accent color
  shadowColor: theme.isDark ? theme.primaryAccent : '#000000',
  shadowOffset: { width: 0, height: theme.isDark ? 4 : 6 },
  shadowOpacity: theme.isDark ? 0.55 : 0.15,
  shadowRadius: theme.isDark ? 20 : 12,
  // Android fallback (note: elevation color can't be customized on Android)
  elevation: theme.isDark ? 12 : 3,
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
