/**
 * Accessibility Utilities
 * Helpers for making the app accessible to all users
 */

import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility roles
export type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'text'
  | 'adjustable'
  | 'header'
  | 'summary'
  | 'checkbox'
  | 'radio'
  | 'menu'
  | 'menuitem'
  | 'progressbar'
  | 'slider'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

// Accessibility state
export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

// Accessibility props for components
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{ name: string; label?: string }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Generate accessibility props for a button
 */
export function buttonAccessibility(
  label: string,
  options?: {
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
  }
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: {
      disabled: options?.disabled,
      selected: options?.selected,
    },
  };
}

/**
 * Generate accessibility props for an image
 */
export function imageAccessibility(
  description: string,
  isDecorative = false
): AccessibilityProps {
  if (isDecorative) {
    return {
      accessible: false,
      importantForAccessibility: 'no',
    };
  }

  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: description,
  };
}

/**
 * Generate accessibility props for a text input
 */
export function inputAccessibility(
  label: string,
  options?: {
    hint?: string;
    error?: string;
    required?: boolean;
  }
): AccessibilityProps {
  let accessibilityLabel = label;

  if (options?.required) {
    accessibilityLabel += ', required';
  }

  if (options?.error) {
    accessibilityLabel += `, error: ${options.error}`;
  }

  return {
    accessible: true,
    accessibilityLabel,
    accessibilityHint: options?.hint,
  };
}

/**
 * Generate accessibility props for a checkbox or switch
 */
export function toggleAccessibility(
  label: string,
  checked: boolean,
  options?: {
    hint?: string;
    disabled?: boolean;
    type?: 'checkbox' | 'switch';
  }
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: options?.type || 'checkbox',
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: {
      checked,
      disabled: options?.disabled,
    },
  };
}

/**
 * Generate accessibility props for a header
 */
export function headerAccessibility(
  text: string,
  level?: 1 | 2 | 3 | 4 | 5 | 6
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: level ? `Heading level ${level}: ${text}` : text,
  };
}

/**
 * Generate accessibility props for a progress indicator
 */
export function progressAccessibility(
  current: number,
  total: number,
  label?: string
): AccessibilityProps {
  const percentage = Math.round((current / total) * 100);

  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: label || 'Progress',
    accessibilityValue: {
      min: 0,
      max: total,
      now: current,
      text: `${percentage}% complete`,
    },
  };
}

/**
 * Generate accessibility props for a tab
 */
export function tabAccessibility(
  label: string,
  selected: boolean,
  index: number,
  total: number
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'tab',
    accessibilityLabel: `${label}, tab ${index + 1} of ${total}`,
    accessibilityState: {
      selected,
    },
  };
}

/**
 * Generate accessibility props for a list item
 */
export function listItemAccessibility(
  label: string,
  index: number,
  total: number,
  options?: {
    hint?: string;
    selected?: boolean;
  }
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: `${label}, item ${index + 1} of ${total}`,
    accessibilityHint: options?.hint,
    accessibilityState: {
      selected: options?.selected,
    },
  };
}

/**
 * Announce to screen reader
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Check if reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Listen for screen reader changes
 */
export function addScreenReaderChangedListener(
  callback: (enabled: boolean) => void
): () => void {
  const subscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    callback
  );

  return () => subscription.remove();
}

/**
 * Set accessibility focus on an element
 */
export function setAccessibilityFocus(ref: { current: any } | null): void {
  if (ref?.current) {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
}

/**
 * Format currency for screen readers
 */
export function formatCurrencyForAccessibility(
  amount: number,
  currency = 'USD'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });

  const formatted = formatter.format(amount);

  // Convert to spoken format: "$19.99" -> "19 dollars and 99 cents"
  const [dollars, cents] = amount.toFixed(2).split('.');

  if (cents === '00') {
    return `${dollars} ${currency === 'USD' ? 'dollars' : currency}`;
  }

  return `${dollars} ${currency === 'USD' ? 'dollars' : currency} and ${cents} cents`;
}

/**
 * Format date for screen readers
 */
export function formatDateForAccessibility(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get platform-specific accessibility label
 */
export function getPlatformAccessibilityLabel(
  iosLabel: string,
  androidLabel?: string
): string {
  return Platform.OS === 'ios' ? iosLabel : androidLabel || iosLabel;
}

/**
 * Create accessible tap target size
 * iOS recommends 44x44pt, Android recommends 48x48dp
 */
export function getMinimumTapTarget(): { minWidth: number; minHeight: number } {
  const size = Platform.OS === 'ios' ? 44 : 48;
  return {
    minWidth: size,
    minHeight: size,
  };
}

/**
 * Check contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirements(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const requirements = {
    AA: isLargeText ? 3 : 4.5,
    AAA: isLargeText ? 4.5 : 7,
  };

  return ratio >= requirements[level];
}
