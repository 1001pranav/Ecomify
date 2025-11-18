'use client';

import { useState } from 'react';
import { Label, Input } from '@ecomify/ui';

/**
 * ColorPicker Component
 *
 * Allows users to select colors for theme customization
 */

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  // Extract color from HSL or use as-is
  const [colorValue, setColorValue] = useState(value);

  const handleChange = (newValue: string) => {
    setColorValue(newValue);
    onChange(newValue);
  };

  // Convert HSL to hex for color input (simplified)
  const getHexColor = (hslString: string): string => {
    // For demonstration, return a default color
    // In production, implement proper HSL to Hex conversion
    if (hslString.includes('hsl')) {
      return '#000000';
    }
    return hslString;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={getHexColor(colorValue)}
            onChange={(e) => handleChange(e.target.value)}
            className="h-10 w-16 cursor-pointer p-1"
          />
          <Input
            type="text"
            value={colorValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="hsl(222, 47%, 11%)"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
