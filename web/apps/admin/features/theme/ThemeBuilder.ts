/**
 * ThemeBuilder - Builder Pattern Implementation
 *
 * Builds theme configuration step by step
 * Provides a fluent interface for creating themes
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeLogo {
  url: string;
  width: number;
  height: number;
}

export interface Theme {
  id?: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  logo?: ThemeLogo;
  borderRadius: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ThemeBuilder Class
 * Implements the Builder Pattern for theme construction
 */
export class ThemeBuilder {
  private theme: Partial<Theme> = {};

  constructor() {
    // Set default values
    this.theme = {
      name: 'Custom Theme',
      colors: {
        primary: 'hsl(222.2, 47.4%, 11.2%)',
        secondary: 'hsl(210, 40%, 96.1%)',
        accent: 'hsl(210, 40%, 96.1%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(222.2, 47.4%, 11.2%)',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      borderRadius: '0.5rem',
    };
  }

  /**
   * Set theme name
   */
  setName(name: string): ThemeBuilder {
    this.theme.name = name;
    return this;
  }

  /**
   * Set primary color
   */
  setPrimaryColor(color: string): ThemeBuilder {
    if (this.theme.colors) {
      this.theme.colors.primary = color;
    }
    return this;
  }

  /**
   * Set secondary color
   */
  setSecondaryColor(color: string): ThemeBuilder {
    if (this.theme.colors) {
      this.theme.colors.secondary = color;
    }
    return this;
  }

  /**
   * Set accent color
   */
  setAccentColor(color: string): ThemeBuilder {
    if (this.theme.colors) {
      this.theme.colors.accent = color;
    }
    return this;
  }

  /**
   * Set background color
   */
  setBackgroundColor(color: string): ThemeBuilder {
    if (this.theme.colors) {
      this.theme.colors.background = color;
    }
    return this;
  }

  /**
   * Set foreground color
   */
  setForegroundColor(color: string): ThemeBuilder {
    if (this.theme.colors) {
      this.theme.colors.foreground = color;
    }
    return this;
  }

  /**
   * Set all colors at once
   */
  setColors(colors: ThemeColors): ThemeBuilder {
    this.theme.colors = colors;
    return this;
  }

  /**
   * Set heading font
   */
  setHeadingFont(font: string): ThemeBuilder {
    if (this.theme.fonts) {
      this.theme.fonts.heading = font;
    }
    return this;
  }

  /**
   * Set body font
   */
  setBodyFont(font: string): ThemeBuilder {
    if (this.theme.fonts) {
      this.theme.fonts.body = font;
    }
    return this;
  }

  /**
   * Set both fonts at once
   */
  setFonts(fonts: ThemeFonts): ThemeBuilder {
    this.theme.fonts = fonts;
    return this;
  }

  /**
   * Set logo
   */
  setLogo(logo: ThemeLogo): ThemeBuilder {
    this.theme.logo = logo;
    return this;
  }

  /**
   * Set border radius
   */
  setBorderRadius(radius: string): ThemeBuilder {
    this.theme.borderRadius = radius;
    return this;
  }

  /**
   * Load theme from existing configuration
   */
  fromTheme(theme: Theme): ThemeBuilder {
    this.theme = { ...theme };
    return this;
  }

  /**
   * Reset to default theme
   */
  reset(): ThemeBuilder {
    this.theme = {
      name: 'Custom Theme',
      colors: {
        primary: 'hsl(222.2, 47.4%, 11.2%)',
        secondary: 'hsl(210, 40%, 96.1%)',
        accent: 'hsl(210, 40%, 96.1%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(222.2, 47.4%, 11.2%)',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      borderRadius: '0.5rem',
    };
    return this;
  }

  /**
   * Build and return the final theme
   */
  build(): Theme {
    return {
      ...this.theme,
      updatedAt: new Date(),
    } as Theme;
  }

  /**
   * Clone the current builder
   */
  clone(): ThemeBuilder {
    const builder = new ThemeBuilder();
    builder.theme = { ...this.theme };
    return builder;
  }

  /**
   * Validate the theme configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.theme.name) {
      errors.push('Theme name is required');
    }

    if (!this.theme.colors) {
      errors.push('Theme colors are required');
    }

    if (!this.theme.fonts) {
      errors.push('Theme fonts are required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Factory function to create a new theme builder
 */
export function createThemeBuilder(): ThemeBuilder {
  return new ThemeBuilder();
}

/**
 * Preset themes
 */
export const presetThemes: Theme[] = [
  {
    name: 'Default',
    colors: {
      primary: 'hsl(222.2, 47.4%, 11.2%)',
      secondary: 'hsl(210, 40%, 96.1%)',
      accent: 'hsl(210, 40%, 96.1%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 47.4%, 11.2%)',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    borderRadius: '0.5rem',
  },
  {
    name: 'Dark',
    colors: {
      primary: 'hsl(210, 40%, 98%)',
      secondary: 'hsl(217.2, 32.6%, 17.5%)',
      accent: 'hsl(217.2, 32.6%, 17.5%)',
      background: 'hsl(222.2, 84%, 4.9%)',
      foreground: 'hsl(210, 40%, 98%)',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    borderRadius: '0.5rem',
  },
  {
    name: 'Ocean',
    colors: {
      primary: 'hsl(199, 89%, 48%)',
      secondary: 'hsl(199, 89%, 90%)',
      accent: 'hsl(199, 89%, 90%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(199, 89%, 10%)',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans',
    },
    borderRadius: '0.75rem',
  },
];
