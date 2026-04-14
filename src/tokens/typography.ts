/**
 * Typography Token System
 * Provides font families, sizes, weights, line heights, and letter spacing
 * Supports both Latin (Inter) and Arabic (Cairo) fonts
 */

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    arabic: ['Cairo', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
  },
  fontSize: {
    display: {
      size: '3.75rem', // 60px
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    h1: {
      size: '3rem', // 48px
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h2: {
      size: '2.25rem', // 36px
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h3: {
      size: '1.875rem', // 30px
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    h4: {
      size: '1.5rem', // 24px
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    body: {
      size: '1rem', // 16px
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    small: {
      size: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    caption: {
      size: '0.75rem', // 12px
      lineHeight: '1.5',
      letterSpacing: '0.01em',
    },
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
