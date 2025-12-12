import { Image } from 'expo-image';

/**
 * Performance utilities for image optimization and app responsiveness
 */

export const ImageUtils = {
  // Preload critical images
  preloadCriticalImages: async (imageUrls: string[]): Promise<void> => {
    try {
      const preloadPromises = imageUrls.map(url =>
        Image.prefetch(url, { cachePolicy: 'memory-disk' })
      );
      await Promise.all(preloadPromises);
    } catch (error) {
      console.warn('Critical image preloading failed:', error);
    }
  },

  // Clear image cache when memory is low
  clearImageCache: async (): Promise<void> => {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
  },

  // Get optimized image props
  getOptimizedImageProps: (source: any) => ({
    source,
    contentFit: 'cover' as const,
    transition: 200,
    cachePolicy: 'memory-disk' as const,
    placeholderContentFit: 'cover' as const,
  }),
};

export const PerformanceUtils = {
  // Debounce function for search and scroll events
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

export default { ImageUtils, PerformanceUtils };