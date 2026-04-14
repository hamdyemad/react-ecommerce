# Design System & Styling Guide

## Core Principles
The project uses a custom design system bridged with Tailwind CSS 4. The source of truth for design tokens resides in `src/tokens/`.

## Token Definitions (`src/tokens/`)
1. **Colors (`colors.ts`)**: 
   - A monochromatic palette based on (White, Grey, Black) and primary/secondary colors.
   - Distinct objects for `light` and `dark` themes accessed via `tokens.colors[mode]`.
2. **Gradients (`gradients.ts`)**:
   - Primary: Purple to Indigo.
   - Secondary: Violet to Pink.
   - Surface: Theme-aware translucent gradients for cards and modals.
   - Glow: Theme-aware radial gradients.
3. **Shadows (`shadows.ts`)**:
   - Standard levels: `sm`, `md`, `lg`, `xl`, `2xl`.
   - Specialized `glow` shadows for vibrant UI elements.
4. **Typography (`typography.ts`)**: 
   - English font: **Inter** (applied by default on `ltr`).
   - Arabic font: **Cairo** (forced on `rtl` via `src/index.css`).
5. **Spacing & Breakpoints**: Standardized scaling for layout consistency.

## Theming & Dark Mode
- Handled through `src/hooks/useTheme.tsx`. Toggling it applies the `.dark` class to the HTML base node.
- Design tokens are accessed dynamically: `tokens.colors[mode].text.primary`.

## Directional Support (RTL/LTR)
- `src/hooks/useDirection.tsx` manages language (`en`, `ar`) and injects visual orientation (`dir="rtl"` or `dir="ltr"`) into the `<html>` element.
- **RTL Rules (in `index.css`)**:
  ```css
  html[dir="rtl"], html[dir="rtl"] body, html[dir="rtl"] * {
    font-family: 'Cairo', sans-serif !important;
  }
  ```

## UI Components
- **Carousel**: Custom implementation with touch/drag support and RTL-aware sliding logic.
- **ProductGrid**: Responsive grid system handling card hover states and quick view actions.
- **Glassmorphism**: Achieved via `.glass` utility and `backdropFilter`.

## Implementation Rules
1. **No Hardcoded Colors**: Always use `tokens.colors[mode]...` or `tokens.gradients...`.
2. **Translation Mandatory**: Every string must go through `t('key')` from `useTranslation`.
3. **Theme Awareness**: Consider both light and dark variants for every new component.
