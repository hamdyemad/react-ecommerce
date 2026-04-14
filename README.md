# eCommerce Design System

A production-ready, enterprise-grade design system for modern eCommerce platforms built with React, TypeScript, Tailwind CSS, and motion.dev.

> [!NOTE]
> Detailed development documentation and architectural guides can be found in the [`/_docs`](./_docs) folder.

## Features

✨ **Comprehensive Component Library** - Atomic design methodology (atoms → molecules → organisms)
🎨 **Design Tokens** - Centralized color, typography, spacing, and motion tokens
🌓 **Dark Mode** - Full light/dark theme support with smooth transitions
🌍 **Internationalization** - Native RTL/LTR support for Arabic and English
♿ **Accessibility** - WCAG AA compliant with ARIA attributes
🎭 **Motion Design** - Sophisticated animations with motion.dev
📦 **Type-Safe** - Full TypeScript support with comprehensive type definitions
🧪 **Tested** - Unit and property-based testing with Vitest

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test        # Run tests in watch mode
npm run test:ui     # Run tests with UI
npm run test:run    # Run tests once
```

## Project Structure

```
src/
├── tokens/              # Design tokens (colors, typography, spacing, motion)
├── components/
│   ├── atoms/          # Basic UI components (Button, Input, Badge)
│   ├── molecules/      # Composite components (ProductCard, CartItem)
│   └── organisms/      # Complex components (Header, CheckoutFlow)
├── hooks/              # React hooks (useTheme, useDirection)
├── utils/              # Utility functions (cn, rtl, motion)
└── tests/              # Test files and setup
```

## Components

### Atomic Components

- **Button** - Multiple variants (primary, secondary, outline, ghost, destructive), sizes, loading states
- **Input** - Form inputs with labels, errors, helper text, icons, RTL support
- **Badge** - Status indicators with variants and dot indicators

### Theme System

```tsx
import { ThemeProvider, useTheme } from '@/hooks/useTheme';

function App() {
  return (
    <ThemeProvider defaultMode="light">
      <YourApp />
    </ThemeProvider>
  );
}

function Component() {
  const { mode, toggleMode } = useTheme();
  return <button onClick={toggleMode}>Toggle Theme</button>;
}
```

### Internationalization

```tsx
import { DirectionProvider, useDirection } from '@/hooks/useDirection';

function App() {
  return (
    <DirectionProvider defaultLanguage="en">
      <YourApp />
    </DirectionProvider>
  );
}

function Component() {
  const { language, setLanguage } = useDirection();
  return <button onClick={() => setLanguage('ar')}>العربية</button>;
}
```

## Design Tokens

All design tokens are available as TypeScript objects:

```tsx
import { colors, typography, spacing, motion } from '@/tokens';

// Use in your components
const primaryColor = colors.light.primary.DEFAULT;
const headingSize = typography.fontSize.h1.size;
const mediumSpacing = spacing[4];
const fastDuration = motion.duration.fast;
```

## Tailwind Configuration

The design system extends Tailwind CSS with custom tokens:

```tsx
// Use design tokens in className
<div className="bg-primary text-white p-4 rounded-lg">
  <h1 className="text-h1 font-bold">Hello World</h1>
</div>
```

## Contributing

1. Follow the atomic design methodology
2. Ensure all components support theming and RTL/LTR
3. Include ARIA attributes for accessibility
4. Write tests for new components
5. Update documentation

## License

MIT
