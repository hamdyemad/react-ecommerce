/**
 * Breakpoint Token System
 * Provides responsive breakpoints for mobile, tablet, desktop, and wide-screen layouts
 */

export const breakpoints = {
  sm: '640px',   // Mobile landscape / Small tablet
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Wide desktop
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Media query helpers for responsive design
 */
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;
