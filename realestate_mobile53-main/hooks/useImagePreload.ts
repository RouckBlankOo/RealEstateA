import { useState, useEffect } from 'react';
import { Image } from 'expo-image';

interface UseImagePreloadResult {
  isLoaded: boolean;
  preloadImages: (urls: string[]) => Promise<void>;
}

export const useImagePreload = (): UseImagePreloadResult => {
  const [isLoaded, setIsLoaded] = useState(false);

  const preloadImages = async (urls: string[]): Promise<void> => {
    try {
      setIsLoaded(false);
      
      // Preload all images in parallel
      const preloadPromises = urls.map(url => {
        return Image.prefetch(url, {
          cachePolicy: 'memory-disk',
        });
      });

      await Promise.all(preloadPromises);
      setIsLoaded(true);
    } catch (error) {
      console.warn('Image preloading failed:', error);
      setIsLoaded(true); // Don't block UI even if preloading fails
    }
  };

  return { isLoaded, preloadImages };
};

export default useImagePreload;