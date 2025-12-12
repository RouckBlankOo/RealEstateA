import { useEffect, useState } from 'react';
import { imagePreloader } from '../services/imagePreloader';

export const useAppInitialization = () => {
  const [isImagesPreloaded, setIsImagesPreloaded] = useState(false);
  const [preloadError, setPreloadError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app with image preloading...');
        
        // Start preloading critical images immediately
        await imagePreloader.preloadCriticalImages();
        
        setIsImagesPreloaded(true);
        console.log('✅ App initialization completed successfully');
      } catch (error) {
        console.warn('⚠️ App initialization had issues:', error);
        setPreloadError(error as Error);
        // Still mark as completed to not block the UI
        setIsImagesPreloaded(true);
      }
    };

    initializeApp();
  }, []);

  return {
    isImagesPreloaded,
    preloadError,
  };
};

export default useAppInitialization;