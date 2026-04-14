import type { Direction } from '@/hooks/useDirection';

/**
 * RTL Utility Functions
 * Provides direction-aware CSS property helpers
 */

/**
 * Get the appropriate margin-start property based on direction
 */
export function marginStart(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { marginRight: value }
    : { marginLeft: value };
}

/**
 * Get the appropriate margin-end property based on direction
 */
export function marginEnd(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { marginLeft: value }
    : { marginRight: value };
}

/**
 * Get the appropriate padding-start property based on direction
 */
export function paddingStart(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { paddingRight: value }
    : { paddingLeft: value };
}

/**
 * Get the appropriate padding-end property based on direction
 */
export function paddingEnd(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { paddingLeft: value }
    : { paddingRight: value };
}

/**
 * Get the appropriate left property based on direction
 */
export function start(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { right: value }
    : { left: value };
}

/**
 * Get the appropriate right property based on direction
 */
export function end(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { left: value }
    : { right: value };
}

/**
 * Get the appropriate border-radius properties for start based on direction
 */
export function borderRadiusStart(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { borderTopRightRadius: value, borderBottomRightRadius: value }
    : { borderTopLeftRadius: value, borderBottomLeftRadius: value };
}

/**
 * Get the appropriate border-radius properties for end based on direction
 */
export function borderRadiusEnd(value: string, direction: Direction): Record<string, string> {
  return direction === 'rtl'
    ? { borderTopLeftRadius: value, borderBottomLeftRadius: value }
    : { borderTopRightRadius: value, borderBottomRightRadius: value };
}

/**
 * Get the appropriate text-align property based on direction
 */
export function textAlignStart(direction: Direction): Record<string, string> {
  return { textAlign: direction === 'rtl' ? 'right' : 'left' };
}

/**
 * Get the appropriate text-align property based on direction
 */
export function textAlignEnd(direction: Direction): Record<string, string> {
  return { textAlign: direction === 'rtl' ? 'left' : 'right' };
}

/**
 * Flip a numeric value for RTL (useful for transforms)
 */
export function flipValue(value: number, direction: Direction): number {
  return direction === 'rtl' ? -value : value;
}

/**
 * Get direction-aware transform translateX
 */
export function translateX(value: number, direction: Direction): string {
  const flipped = flipValue(value, direction);
  return `translateX(${flipped}px)`;
}

/**
 * Combine multiple direction-aware styles
 */
export function directionStyles(
  styles: Record<string, string>,
  direction: Direction
): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    switch (key) {
      case 'marginStart':
        Object.assign(result, marginStart(value, direction));
        break;
      case 'marginEnd':
        Object.assign(result, marginEnd(value, direction));
        break;
      case 'paddingStart':
        Object.assign(result, paddingStart(value, direction));
        break;
      case 'paddingEnd':
        Object.assign(result, paddingEnd(value, direction));
        break;
      case 'start':
        Object.assign(result, start(value, direction));
        break;
      case 'end':
        Object.assign(result, end(value, direction));
        break;
      default:
        result[key] = value;
    }
  });
  
  return result;
}
