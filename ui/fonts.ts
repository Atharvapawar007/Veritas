// SF Pro Display Bold font configuration for consistent usage across the app
export const fonts = {
  regular: 'SF Pro Display Bold',
  bold: 'SF Pro Display Bold',
} as const;

// Font weight mappings for different use cases
export const fontStyles = {
  // Headers and titles
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontWeight: '600' as const,
  },
  
  // Body text
  body: {
    fontFamily: fonts.bold,
    fontWeight: '400' as const,
  },
  bodyLight: {
    fontFamily: fonts.bold,
    fontWeight: '400' as const,
  },
  
  // UI elements
  button: {
    fontFamily: fonts.bold,
    fontWeight: '500' as const,
  },
  caption: {
    fontFamily: fonts.bold,
    fontWeight: '400' as const,
  },
  
  // Navigation and tabs
  tabLabel: {
    fontFamily: fonts.bold,
    fontWeight: '500' as const,
  },
  
  // Input fields
  input: {
    fontFamily: fonts.bold,
    fontWeight: '400' as const,
  },
} as const;

export type FontStyle = keyof typeof fontStyles;
