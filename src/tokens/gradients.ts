export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  surface: {
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
    dark: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
  },
  glow: {
    primary: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
    secondary: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
    purple: {
      light: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
      dark: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
    },
    blue: {
      light: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
      dark: 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)',
    }
  }
} as const;
