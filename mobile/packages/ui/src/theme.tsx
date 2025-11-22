/**
 * Theme Configuration
 * Provider Pattern for theme management
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  MD3LightTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { useColorScheme } from 'react-native';

// Custom theme colors
const customColors = {
  primary: '#2563eb',
  primaryContainer: '#dbeafe',
  secondary: '#7c3aed',
  secondaryContainer: '#ede9fe',
  tertiary: '#059669',
  tertiaryContainer: '#d1fae5',
  error: '#dc2626',
  errorContainer: '#fee2e2',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    onBackground: '#1f2937',
    onSurface: '#1f2937',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
    outlineVariant: '#e5e7eb',
  },
  custom: {
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    onBackground: '#f8fafc',
    onSurface: '#f8fafc',
    onSurfaceVariant: '#94a3b8',
    outline: '#475569',
    outlineVariant: '#334155',
  },
  custom: {
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  },
};

export type AppTheme = typeof lightTheme;

// Theme Context
interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: 'light' | 'dark';
}

/**
 * Theme Provider
 * Wraps the app with Paper provider and custom theme
 */
export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = React.useState(
    forcedTheme === 'dark' || (forcedTheme !== 'light' && colorScheme === 'dark')
  );

  // Update when system theme changes
  React.useEffect(() => {
    if (!forcedTheme) {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme, forcedTheme]);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const contextValue = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme
 */
export function useAppTheme() {
  const theme = usePaperTheme<AppTheme>();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  return { ...theme, isDark, toggleTheme };
}
