/**
 * Design Tokens
 * Centralized design system values for colors, typography, spacing, etc.
 */

export const colors = {
  // Brand colors
  primary: {
    50: 'hsl(210, 100%, 98%)',
    100: 'hsl(210, 100%, 95%)',
    200: 'hsl(210, 100%, 90%)',
    300: 'hsl(210, 100%, 80%)',
    400: 'hsl(210, 100%, 70%)',
    500: 'hsl(210, 100%, 60%)',
    600: 'hsl(210, 100%, 50%)',
    700: 'hsl(210, 100%, 40%)',
    800: 'hsl(210, 100%, 30%)',
    900: 'hsl(210, 100%, 20%)',
  },
  secondary: {
    50: 'hsl(270, 100%, 98%)',
    100: 'hsl(270, 100%, 95%)',
    200: 'hsl(270, 100%, 90%)',
    300: 'hsl(270, 100%, 80%)',
    400: 'hsl(270, 100%, 70%)',
    500: 'hsl(270, 100%, 60%)',
    600: 'hsl(270, 100%, 50%)',
    700: 'hsl(270, 100%, 40%)',
    800: 'hsl(270, 100%, 30%)',
    900: 'hsl(270, 100%, 20%)',
  },
  // Semantic colors
  success: {
    light: 'hsl(142, 76%, 36%)',
    DEFAULT: 'hsl(142, 76%, 26%)',
    dark: 'hsl(142, 76%, 16%)',
  },
  warning: {
    light: 'hsl(38, 92%, 50%)',
    DEFAULT: 'hsl(38, 92%, 40%)',
    dark: 'hsl(38, 92%, 30%)',
  },
  error: {
    light: 'hsl(0, 84%, 60%)',
    DEFAULT: 'hsl(0, 84%, 50%)',
    dark: 'hsl(0, 84%, 40%)',
  },
  // Neutral colors
  gray: {
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(0, 0%, 96%)',
    200: 'hsl(0, 0%, 93%)',
    300: 'hsl(0, 0%, 87%)',
    400: 'hsl(0, 0%, 74%)',
    500: 'hsl(0, 0%, 62%)',
    600: 'hsl(0, 0%, 49%)',
    700: 'hsl(0, 0%, 38%)',
    800: 'hsl(0, 0%, 26%)',
    900: 'hsl(0, 0%, 13%)',
  },
};

export const typography = {
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  },
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};
