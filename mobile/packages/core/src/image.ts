/**
 * Image Optimization Utilities
 * Handles image loading, caching, and optimization
 */

// Image sizes for different use cases
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
  full: { width: 1200, height: 1200 },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

// Image quality settings
export const IMAGE_QUALITY = {
  low: 60,
  medium: 80,
  high: 90,
  max: 100,
} as const;

export type ImageQuality = keyof typeof IMAGE_QUALITY;

// Image placeholder types
export type PlaceholderType = 'blur' | 'color' | 'none';

export interface ImageSource {
  uri: string;
  width?: number;
  height?: number;
  cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
  headers?: Record<string, string>;
}

export interface OptimizedImageConfig {
  source: string;
  size?: ImageSize;
  quality?: ImageQuality;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Generate optimized image URL with transformations
 * Works with CDN providers like Cloudinary, Imgix, etc.
 */
export function getOptimizedImageUrl(config: OptimizedImageConfig): string {
  const { source, size = 'medium', quality = 'medium', format = 'webp', fit = 'cover' } = config;

  // If it's a local file or placeholder, return as-is
  if (source.startsWith('file://') || source.startsWith('data:') || source.includes('placeholder')) {
    return source;
  }

  // Build transformation parameters
  const dimensions = IMAGE_SIZES[size];
  const qualityValue = IMAGE_QUALITY[quality];

  // Example: Cloudinary URL transformation
  // In production, use your actual CDN's URL format
  try {
    const url = new URL(source);

    // If already a CDN URL with transformations, return as-is
    if (url.searchParams.has('w') || url.searchParams.has('width')) {
      return source;
    }

    // Add transformation parameters
    url.searchParams.set('w', dimensions.width.toString());
    url.searchParams.set('h', dimensions.height.toString());
    url.searchParams.set('q', qualityValue.toString());
    url.searchParams.set('f', format);
    url.searchParams.set('fit', fit);

    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return source;
  }
}

/**
 * Generate responsive image sources for different sizes
 */
export function getResponsiveImageSources(source: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  full: string;
} {
  return {
    thumbnail: getOptimizedImageUrl({ source, size: 'thumbnail' }),
    small: getOptimizedImageUrl({ source, size: 'small' }),
    medium: getOptimizedImageUrl({ source, size: 'medium' }),
    large: getOptimizedImageUrl({ source, size: 'large' }),
    full: getOptimizedImageUrl({ source, size: 'full' }),
  };
}

/**
 * Get appropriate image size based on container dimensions
 */
export function getImageSizeForContainer(containerWidth: number): ImageSize {
  if (containerWidth <= 100) return 'thumbnail';
  if (containerWidth <= 200) return 'small';
  if (containerWidth <= 400) return 'medium';
  if (containerWidth <= 800) return 'large';
  return 'full';
}

/**
 * Create image source object for React Native Image component
 */
export function createImageSource(
  uri: string,
  options?: {
    cache?: ImageSource['cache'];
    headers?: Record<string, string>;
  }
): ImageSource {
  return {
    uri,
    cache: options?.cache || 'default',
    headers: options?.headers,
  };
}

/**
 * Preload images for faster display
 */
export async function preloadImages(urls: string[]): Promise<void> {
  // In React Native, this would use Image.prefetch
  // For now, we'll simulate the interface
  await Promise.all(
    urls.map(async (url) => {
      // Image.prefetch(url) in real implementation
      return Promise.resolve();
    })
  );
}

/**
 * Get placeholder color from image (dominant color extraction)
 * In production, this would use a library like fast-average-color
 */
export function getPlaceholderColor(_imageUrl: string): string {
  // Return a neutral gray as default placeholder
  return '#e5e7eb';
}

/**
 * Generate blur hash placeholder URL
 * In production, use blurhash library
 */
export function getBlurPlaceholder(blurhash: string): string {
  // Return a data URL for the blur placeholder
  // This is a simplified version - real implementation would decode blurhash
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#b)"/>
    </svg>`
  )}`;
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get dimensions maintaining aspect ratio
 */
export function getDimensionsWithAspectRatio(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Check if URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();

  // Check file extension
  if (imageExtensions.some((ext) => lowerUrl.endsWith(ext))) {
    return true;
  }

  // Check for common image CDN patterns
  if (lowerUrl.includes('/image/') || lowerUrl.includes('/images/') || lowerUrl.includes('/img/')) {
    return true;
  }

  // Check for data URLs
  if (lowerUrl.startsWith('data:image/')) {
    return true;
  }

  return true; // Default to true for URLs without extension
}

/**
 * Get fallback image URL
 */
export function getFallbackImage(type: 'product' | 'user' | 'store' = 'product'): string {
  const fallbacks: Record<string, string> = {
    product: 'https://via.placeholder.com/400x400?text=No+Image',
    user: 'https://via.placeholder.com/200x200?text=User',
    store: 'https://via.placeholder.com/600x400?text=Store',
  };

  return fallbacks[type] || fallbacks.product;
}
