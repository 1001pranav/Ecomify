/**
 * Theme Configuration DTO with Zod validation
 * Implements validation for store theme customization
 */

import { z } from 'zod';

// Zod schema for theme configuration
export const ThemeConfigSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Primary color must be a valid hex color',
    }),
    secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Secondary color must be a valid hex color',
    }),
    accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Accent color must be a valid hex color',
    }),
    background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Background color must be a valid hex color',
    }),
    text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Text color must be a valid hex color',
    }),
  }),
  typography: z.object({
    fontFamily: z.string().min(1, 'Font family is required'),
    headingFont: z.string().min(1, 'Heading font is required'),
  }),
  layout: z.object({
    headerStyle: z.enum(['fixed', 'static']),
    sidebarPosition: z.enum(['left', 'right']),
  }),
  customCSS: z.string().optional(),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// Default theme configuration
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
  },
  layout: {
    headerStyle: 'fixed',
    sidebarPosition: 'left',
  },
};
