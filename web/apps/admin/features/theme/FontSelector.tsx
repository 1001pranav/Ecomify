'use client';

import { Label, Select } from '@ecomify/ui';

/**
 * FontSelector Component
 *
 * Allows users to select fonts from a predefined list
 */

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const popularFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Ubuntu',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'PT Sans',
  'Source Sans Pro',
  'Oswald',
  'Quicksand',
];

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: value }}
      >
        {popularFonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}
