/**
 * Design Token System - Main Entry Point
 * Exports all foundation tokens for the eCommerce Design System
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { breakpoints, mediaQueries } from './breakpoints';
import { motion, animationPresets } from './motion';
import { gradients } from './gradients';
import { shadows } from './shadows';

export { colors, typography, spacing, breakpoints, mediaQueries, motion, animationPresets, gradients, shadows };

export type { ColorTheme, ColorScale } from './colors';
export type { FontFamily, FontSize, FontWeight } from './typography';
export type { SpacingKey } from './spacing';
export type { BreakpointKey } from './breakpoints';
export type { MotionDuration, MotionEasing, MotionDelay, AnimationPreset } from './motion';

/**
 * Complete token collection for easy access
 */
export const tokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  motion,
  animationPresets,
  gradients,
  shadows,
} as const;
