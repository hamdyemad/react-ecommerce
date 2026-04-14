import { motion, animationPresets } from '@/tokens/motion';
import type { Direction } from '@/hooks/useDirection';

/**
 * Motion Utility Functions
 * Provides helpers for animation and RTL/LTR animation mirroring
 */

/**
 * Get animation preset by name
 */
export function getAnimationPreset(presetName: keyof typeof animationPresets) {
  return animationPresets[presetName];
}

/**
 * Mirror animation for RTL direction
 * Inverts directional properties (x, translateX, marginLeft, etc.)
 */
export function mirrorAnimation(
  animation: Record<string, any>,
  direction: Direction
): Record<string, any> {
  if (direction === 'ltr') {
    return animation;
  }

  const mirrored: Record<string, any> = {};

  Object.entries(animation).forEach(([key, value]) => {
    switch (key) {
      case 'x':
        mirrored[key] = typeof value === 'number' ? -value : value;
        break;
      case 'translateX':
        mirrored[key] = typeof value === 'number' ? -value : value;
        break;
      case 'marginLeft':
        mirrored.marginRight = value;
        break;
      case 'marginRight':
        mirrored.marginLeft = value;
        break;
      case 'paddingLeft':
        mirrored.paddingRight = value;
        break;
      case 'paddingRight':
        mirrored.paddingLeft = value;
        break;
      case 'left':
        mirrored.right = value;
        break;
      case 'right':
        mirrored.left = value;
        break;
      case 'borderTopLeftRadius':
        mirrored.borderTopRightRadius = value;
        break;
      case 'borderTopRightRadius':
        mirrored.borderTopLeftRadius = value;
        break;
      case 'borderBottomLeftRadius':
        mirrored.borderBottomRightRadius = value;
        break;
      case 'borderBottomRightRadius':
        mirrored.borderBottomLeftRadius = value;
        break;
      default:
        mirrored[key] = value;
    }
  });

  return mirrored;
}

/**
 * Get direction-aware animation preset
 */
export function getDirectionalPreset(
  presetName: keyof typeof animationPresets,
  direction: Direction
) {
  const preset = animationPresets[presetName];
  
  return {
    initial: mirrorAnimation(preset.initial, direction),
    animate: mirrorAnimation(preset.animate, direction),
    exit: preset.exit ? mirrorAnimation(preset.exit, direction) : undefined,
    transition: preset.transition,
  };
}

/**
 * Create a stagger animation configuration
 */
export function createStaggerConfig(
  staggerDelay: number = 0.05,
  delayChildren: number = 0
) {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Create a custom transition configuration
 */
export function createTransition(
  duration: keyof typeof motion.duration = 'normal',
  easing: keyof typeof motion.easing = 'easeOut',
  delay: keyof typeof motion.delay = 'none'
) {
  return {
    duration: motion.duration[duration],
    ease: motion.easing[easing],
    delay: motion.delay[delay],
  };
}

/**
 * Hover animation variants
 */
export const hoverVariants = {
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  },
  lift: {
    rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
    hover: { y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' },
    tap: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
  },
  glow: {
    rest: { opacity: 1 },
    hover: { opacity: 0.8 },
    tap: { opacity: 0.6 },
  },
};

/**
 * Loading animation variants
 */
export const loadingVariants = {
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: motion.duration.slow,
        repeat: Infinity,
        ease: motion.easing.easeInOut,
      },
    },
  },
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: motion.duration.slower,
        repeat: Infinity,
        ease: motion.easing.linear,
      },
    },
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: motion.duration.normal,
        repeat: Infinity,
        ease: motion.easing.easeInOut,
      },
    },
  },
};

/**
 * Shimmer effect for skeleton loaders
 */
export const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: motion.duration.slower,
      repeat: Infinity,
      ease: motion.easing.linear,
    },
  },
};
