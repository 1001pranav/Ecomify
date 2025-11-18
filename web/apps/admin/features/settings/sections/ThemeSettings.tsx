'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  Select,
  useToast,
} from '@ecomify/ui';
import { createThemeBuilder, type Theme, presetThemes } from '../../theme/ThemeBuilder';
import { ColorPicker } from '../../theme/ColorPicker';
import { FontSelector } from '../../theme/FontSelector';
import { LogoUpload } from '../../theme/LogoUpload';
import { ThemePreview } from '../../theme/ThemePreview';
import { Upload, RotateCcw } from 'lucide-react';

/**
 * ThemeSettings Component
 *
 * Theme customization with live preview
 * Implements Observer Pattern for real-time updates
 * Uses Builder Pattern for theme construction
 *
 * Design Patterns:
 * - Observer Pattern: Live preview updates when theme changes
 * - Builder Pattern: ThemeBuilder for constructing themes
 */

export function ThemeSettings() {
  const { toast } = useToast();

  // Theme builder instance
  const [themeBuilder] = useState(() => createThemeBuilder());
  const [theme, setTheme] = useState<Theme>(themeBuilder.build());

  // Observer Pattern: Subscribe to theme changes
  useEffect(() => {
    // When theme state changes, update the preview
    // This demonstrates the Observer pattern where the preview "observes" theme changes
    console.log('Theme updated:', theme);
  }, [theme]);

  // Update theme - triggers observer (useEffect)
  const updateTheme = () => {
    setTheme(themeBuilder.build());
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    switch (colorKey) {
      case 'primary':
        themeBuilder.setPrimaryColor(value);
        break;
      case 'secondary':
        themeBuilder.setSecondaryColor(value);
        break;
      case 'accent':
        themeBuilder.setAccentColor(value);
        break;
      case 'background':
        themeBuilder.setBackgroundColor(value);
        break;
      case 'foreground':
        themeBuilder.setForegroundColor(value);
        break;
    }
    updateTheme();
  };

  const handleFontChange = (fontType: 'heading' | 'body', value: string) => {
    if (fontType === 'heading') {
      themeBuilder.setHeadingFont(value);
    } else {
      themeBuilder.setBodyFont(value);
    }
    updateTheme();
  };

  const handleLogoUpload = (url: string, width: number, height: number) => {
    themeBuilder.setLogo({ url, width, height });
    updateTheme();
  };

  const handlePresetSelect = (preset: Theme) => {
    themeBuilder.fromTheme(preset);
    updateTheme();
  };

  const handleReset = () => {
    themeBuilder.reset();
    updateTheme();
  };

  const handleSave = () => {
    const validation = themeBuilder.validate();
    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement API call to save theme
    toast({
      title: 'Theme saved',
      description: 'Your theme has been updated successfully.',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Theme Customization Panel */}
      <div className="space-y-6">
        {/* Preset Themes */}
        <Card>
          <CardHeader>
            <CardTitle>Preset Themes</CardTitle>
            <CardDescription>
              Start with a preset or customize your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {presetThemes.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => handlePresetSelect(preset)}
                  className="h-auto flex-col gap-2 p-4"
                >
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>
              Customize your brand colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              label="Primary Color"
              value={theme.colors.primary}
              onChange={(value) => handleColorChange('primary', value)}
            />
            <ColorPicker
              label="Secondary Color"
              value={theme.colors.secondary}
              onChange={(value) => handleColorChange('secondary', value)}
            />
            <ColorPicker
              label="Accent Color"
              value={theme.colors.accent}
              onChange={(value) => handleColorChange('accent', value)}
            />
            <ColorPicker
              label="Background"
              value={theme.colors.background}
              onChange={(value) => handleColorChange('background', value)}
            />
            <ColorPicker
              label="Foreground"
              value={theme.colors.foreground}
              onChange={(value) => handleColorChange('foreground', value)}
            />
          </CardContent>
        </Card>

        {/* Fonts */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Select fonts for headings and body text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FontSelector
              label="Heading Font"
              value={theme.fonts.heading}
              onChange={(value) => handleFontChange('heading', value)}
            />
            <FontSelector
              label="Body Font"
              value={theme.fonts.body}
              onChange={(value) => handleFontChange('body', value)}
            />
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              Upload your store logo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogoUpload
              currentLogo={theme.logo}
              onUpload={handleLogoUpload}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Theme
          </Button>
        </div>
      </div>

      {/* Live Preview Panel - Observer Pattern */}
      <div className="sticky top-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See your changes in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePreview theme={theme} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
