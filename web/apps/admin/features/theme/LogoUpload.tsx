'use client';

import { useState, useRef } from 'react';
import { Button, Label } from '@ecomify/ui';
import { Upload, X } from 'lucide-react';
import type { ThemeLogo } from './ThemeBuilder';

/**
 * LogoUpload Component
 *
 * Handles logo file upload and preview
 */

interface LogoUploadProps {
  currentLogo?: ThemeLogo;
  onUpload: (url: string, width: number, height: number) => void;
}

export function LogoUpload({ currentLogo, onUpload }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo?.url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        // In production, this would upload to a server
        // For now, just use the data URL
        onUpload(url, img.width, img.height);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Logo preview"
            className="max-h-32 rounded border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute -right-2 -top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No logo uploaded</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {preview ? 'Change Logo' : 'Upload Logo'}
      </Button>

      <p className="text-xs text-muted-foreground">
        Recommended: PNG or SVG, max 2MB
      </p>
    </div>
  );
}
