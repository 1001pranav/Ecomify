'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import { Button } from '@ecomify/ui';
import { useUploadImage } from '@ecomify/api-client';
import { useToast } from '@ecomify/ui';
import type { Image } from '@ecomify/types';

/**
 * ImageUpload Component
 *
 * Provides drag & drop and click-to-upload functionality for product images.
 * Features:
 * - Drag and drop file upload
 * - Click to browse files
 * - Image preview grid with thumbnails
 * - Delete images
 * - Reorder images with drag & drop
 * - File type and size validation
 * - Upload progress indication
 */

interface ImageUploadProps {
  value: Image[];
  onChange: (images: Image[]) => void;
  maxFiles?: number;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({ value, onChange, maxFiles = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadImageMutation = useUploadImage();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    // Check max files
    if (value.length + files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} images.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a valid image format. Only JPG, PNG, and WebP are allowed.`,
          variant: 'destructive',
        });
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
          variant: 'destructive',
        });
        continue;
      }

      validFiles.push(file);
    }

    // Upload valid files
    for (const file of validFiles) {
      setUploadingFiles((prev) => [...prev, file.name]);

      try {
        const response = await uploadImageMutation.mutateAsync({
          file,
          folder: 'products',
        });

        const newImage: Image = {
          id: crypto.randomUUID(),
          url: response.data.url,
          altText: file.name,
        };

        onChange([...value, newImage]);

        toast({
          title: 'Image uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      }
    }
  };

  const handleDelete = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop for reordering
  const handleImageDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...value];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG or WebP. Max file size 5MB. Up to {maxFiles} images.
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((fileName) => (
            <div
              key={fileName}
              className="flex items-center gap-2 p-3 bg-accent rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading {fileName}...</p>
                <div className="mt-1 h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-accent cursor-move"
            >
              <img
                src={image.url}
                alt={image.altText || `Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-2 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </div>

              {/* Drag handle indicator */}
              <div className="absolute top-2 left-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag images to reorder. The first image will be the primary product image.
        </p>
      )}
    </div>
  );
}
