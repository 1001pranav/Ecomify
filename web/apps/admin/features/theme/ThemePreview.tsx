'use client';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@ecomify/ui';
import type { Theme } from './ThemeBuilder';

/**
 * ThemePreview Component
 *
 * Shows a live preview of the theme
 * Demonstrates the Observer Pattern - this component "observes" theme changes
 */

interface ThemePreviewProps {
  theme: Theme;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  // Apply theme styles dynamically
  const previewStyles: React.CSSProperties = {
    '--preview-primary': theme.colors.primary,
    '--preview-secondary': theme.colors.secondary,
    '--preview-background': theme.colors.background,
    '--preview-foreground': theme.colors.foreground,
    fontFamily: theme.fonts.body,
  } as React.CSSProperties;

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Preview Header */}
      <div className="mb-6 flex items-center justify-between">
        {theme.logo ? (
          <img
            src={theme.logo.url}
            alt="Logo"
            className="h-8"
            style={{ maxWidth: '120px' }}
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded"
            style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
          >
            <span className="text-lg font-bold" style={{ fontFamily: theme.fonts.heading }}>
              E
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <div
            className="h-8 w-8 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div
            className="h-8 w-8 rounded-full"
            style={{ backgroundColor: theme.colors.secondary }}
          />
          <div
            className="h-8 w-8 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          />
        </div>
      </div>

      {/* Preview Content */}
      <div className="space-y-4">
        <div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: theme.fonts.heading }}
          >
            Preview Heading
          </h2>
          <p className="text-sm opacity-75">
            This is how your theme will look with body text. The quick brown fox jumps over
            the lazy dog.
          </p>
        </div>

        {/* Preview Button */}
        <button
          className="rounded px-4 py-2 font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
            borderRadius: theme.borderRadius,
          }}
        >
          Primary Button
        </button>

        {/* Preview Card */}
        <div
          className="rounded border p-4"
          style={{
            borderColor: theme.colors.foreground + '20',
            borderRadius: theme.borderRadius,
          }}
        >
          <h3
            className="font-semibold mb-2"
            style={{ fontFamily: theme.fonts.heading }}
          >
            Card Title
          </h3>
          <p className="text-sm opacity-75">
            This is a preview card showing how content will be displayed with your custom
            theme.
          </p>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.colors.foreground + '20' }}>
        <p className="text-xs opacity-75 mb-2">Color Palette</p>
        <div className="flex gap-2">
          <div
            className="flex-1 h-12 rounded flex items-center justify-center text-xs"
            style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
          >
            Primary
          </div>
          <div
            className="flex-1 h-12 rounded flex items-center justify-center text-xs"
            style={{ backgroundColor: theme.colors.secondary, color: theme.colors.foreground }}
          >
            Secondary
          </div>
          <div
            className="flex-1 h-12 rounded flex items-center justify-center text-xs"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.foreground }}
          >
            Accent
          </div>
        </div>
      </div>
    </div>
  );
}
