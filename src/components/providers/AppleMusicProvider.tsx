'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  configureMusicKit,
  authorizeAppleMusic,
  unauthorizeAppleMusic,
} from '@/lib/api/appleMusic';

// Define the shape of the MusicKit instance more precisely if @types/apple-musickit-js is available
// For now, using 'any' for simplicity
interface MusicKitInstance {
  player: any;
  api: any;
  // Add other relevant properties and methods from MusicKitInstance in appleMusic.ts
  readonly isAuthorized: boolean;
  // ... other properties like currentPlaybackTime, nowPlayingItem etc.
}

interface AppleMusicContextType {
  musicKit: MusicKitInstance | null;
  isAuthorized: boolean;
  isLoading: boolean;
  error: Error | null;
  authorize: () => Promise<void>;
  unauthorize: () => Promise<void>;
}

const AppleMusicContext = createContext<AppleMusicContextType | undefined>(
  undefined,
);

export const AppleMusicProvider = ({ children }: { children: ReactNode }) => {
  const [musicKit, setMusicKit] = useState<MusicKitInstance | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initMusicKit = async () => {
      try {
        setIsLoading(true);
        const instance = await configureMusicKit();
        if (isMounted) {
          setMusicKit(instance);
          setIsAuthorized(instance.isAuthorized);
          // Listen to authorization status changes
          // Note: MusicKit event names might be different, refer to official docs.
          // Example: instance.addEventListener('authorizationStatusDidChange', handleAuthChange);
          // Example: instance.addEventListener('playbackStateDidChange', handlePlaybackChange);
        }
      } catch (err: any) {
        console.error('Failed to initialize Apple Music Provider:', err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initMusicKit();

    // Cleanup function to remove event listeners if any were added
    return () => {
      isMounted = false;
      // if (musicKit) {
      //   musicKit.removeEventListener('authorizationStatusDidChange', handleAuthChange);
      // }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const handleAuthorize = async () => {
    if (!musicKit) {
      console.warn('MusicKit not initialized, cannot authorize.');
      setError(new Error('MusicKit not available for authorization.'));
      return;
    }
    try {
      setIsLoading(true);
      const success = await authorizeAppleMusic(); // Uses the one from lib/api
      setIsAuthorized(success);
      if (!success)
        setError(new Error('Authorization failed or was denied by user.'));
      else setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthorize = async () => {
    if (!musicKit) {
      console.warn('MusicKit not initialized, cannot unauthorize.');
      return;
    }
    try {
      await unauthorizeAppleMusic(); // Uses the one from lib/api
      setIsAuthorized(false);
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <AppleMusicContext.Provider
      value={{
        musicKit,
        isAuthorized,
        isLoading,
        error,
        authorize: handleAuthorize,
        unauthorize: handleUnauthorize,
      }}
    >
      {children}
    </AppleMusicContext.Provider>
  );
};

export const useAppleMusic = (): AppleMusicContextType => {
  const context = useContext(AppleMusicContext);
  if (context === undefined) {
    throw new Error('useAppleMusic must be used within an AppleMusicProvider');
  }
  return context;
};
