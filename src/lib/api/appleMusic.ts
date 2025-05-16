import {
  NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
  APPLE_MUSIC_API_BASE_URL,
} from '@/lib/constants/apiKeys';

// Declare the MusicKit global object (or import types if available: @types/apple-musickit-js)
declare global {
  interface Window {
    MusicKit: any;
  }
}

// Define a new interface for player controls
interface AppleInternalPlayer {
  play: () => Promise<any>;
  pause: () => Promise<any>;
  stop: () => Promise<any>;
  skipToNextItem: () => Promise<any>;
  skipToPreviousItem: () => Promise<any>;
  seekToTime: (time: number) => Promise<any>;
  readonly currentPlaybackTime: number;
  readonly currentPlaybackDuration: number;
  readonly nowPlayingItem: MusicKit.MediaItem | null;
  readonly playbackState: MusicKit.PlaybackStates;
}

interface MusicKitInstance {
  player: AppleInternalPlayer; // Player methods are here
  api: any; // Keep as any for now, or use MusicKit.API
  authorize: () => Promise<any>;
  unauthorize: () => Promise<any>;
  // setQueue is directly on the instance, not the player
  setQueue: (options: MusicKit.SetQueueOptions) => Promise<MusicKit.Queue>;
  readonly isAuthorized: boolean; // Directly on the instance
  // Removed player-specific methods and properties from here:
  // play, pause, skipToNextItem, skipToPreviousItem, seekToTime
  // currentPlaybackTime, currentPlaybackDuration, nowPlayingItem, playbackState
}

let musicKitInstance: MusicKitInstance | null = null;
let configurePromise: Promise<MusicKitInstance> | null = null;

/**
 * Configures and returns a MusicKit instance.
 * This function ensures MusicKit is configured only once.
 */
export async function configureMusicKit(): Promise<MusicKitInstance> {
  if (musicKitInstance) {
    return musicKitInstance;
  }

  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // MusicKit JS relies on window and document, so it can't run server-side.
      console.warn('MusicKit can only be configured on the client-side.');
      return reject(
        new Error('MusicKit can only be configured on the client-side.'),
      );
    }

    if (!NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN) {
      console.error('Apple Developer Token is not configured.');
      return reject(
        new Error(
          'Apple Developer Token is not configured. Please set NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN.',
        ),
      );
    }

    // Load MusicKit JS script
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
    script.async = true;
    script.onload = async () => {
      try {
        await window.MusicKit.configure({
          developerToken: NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
          app: {
            name: 'SonoSphere',
            build: '0.1.0', // Replace with your app's build version
          },
          // storeId: 'us', // Optionally specify a storefront
        });
        musicKitInstance = window.MusicKit.getInstance();
        if (!musicKitInstance) {
          throw new Error(
            'Failed to get MusicKit instance after configuration.',
          );
        }
        console.log('MusicKit configured successfully.');
        resolve(musicKitInstance);
      } catch (error) {
        console.error('Error configuring MusicKit:', error);
        reject(error);
      } finally {
        configurePromise = null; // Reset promise after completion
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load MusicKit script:', error);
      reject(new Error('Failed to load MusicKit script.'));
      configurePromise = null; // Reset promise on error
    };
    document.head.appendChild(script);
  });

  return configurePromise;
}

/**
 * Authorizes the user with Apple Music.
 */
export async function authorizeAppleMusic(): Promise<boolean> {
  try {
    const music = await configureMusicKit();
    if (music.isAuthorized) {
      return true;
    }
    await music.authorize();
    return music.isAuthorized;
  } catch (error) {
    console.error('Apple Music authorization error:', error);
    return false;
  }
}

/**
 * Unauthorizes the user from Apple Music.
 */
export async function unauthorizeAppleMusic(): Promise<void> {
  try {
    const music = await configureMusicKit();
    await music.unauthorize();
  } catch (error) {
    console.error('Apple Music unauthorization error:', error);
  }
}

/**
 * Searches Apple Music.
 * @param term The search term.
 * @param types Optional array of types to search for (e.g., ['songs', 'albums', 'artists']).
 * @param limit Optional limit for results per type.
 */
export async function searchAppleMusic(
  term: string,
  types?: string[],
  limit: number = 10,
): Promise<any> {
  try {
    const music = await configureMusicKit();
    if (!music.isAuthorized) {
      // Some API calls might work without full user authorization (e.g. catalog search)
      // but playback will require it.
      console.warn(
        'Apple Music user not authorized. Search results might be limited or playback may fail.',
      );
    }
    // Note: MusicKit.api.search uses the user's storefront.
    // For global search, you might need to use the Apple Music API directly.
    const params = {
      term,
      limit,
      types: types || ['songs', 'albums', 'artists', 'playlists'], // Default search types
      // storefront: 'us' // You might need to handle storefronts
    };
    const results = await music.api.music(
      `${APPLE_MUSIC_API_BASE_URL}/v1/catalog/{storefront}/search`,
      params,
    );
    return results.data.results; // Structure might vary based on API version
  } catch (error: any) {
    console.error(
      'Apple Music search error:',
      error.message,
      error.response?.data,
    );
    throw error;
  }
}

/**
 * Plays an item or a queue of items.
 * @param itemId The ID of the song/album/playlist to play.
 * @param kind The kind of item (e.g., 'song', 'album', 'playlist').
 * @param isCollection (Optional) Whether the ID refers to a collection (album/playlist).
 */
export async function playAppleMusicItem(
  itemId: string,
  kind: 'songs' | 'albums' | 'playlists' | 'stations',
  isCollection: boolean = false,
): Promise<void> {
  try {
    const music = await configureMusicKit();
    if (!music.isAuthorized) {
      const authorized = await authorizeAppleMusic();
      if (!authorized) {
        console.error('Cannot play Apple Music item: User not authorized.');
        throw new Error('User not authorized.');
      }
    }

    const queueOptions: MusicKit.SetQueueOptions = {};
    if (kind === 'songs') {
      queueOptions.song = itemId;
    } else if (kind === 'albums') {
      queueOptions.album = itemId;
    } else if (kind === 'playlists') {
      queueOptions.playlist = itemId;
    } else if (kind === 'stations') {
      // MusicKit.SetQueueOptions doesn't directly support 'station' like this.
      // This might need a different approach or API call if 'station' is a custom concept here
      // For now, casting to any to preserve functionality, but this needs review.
      (queueOptions as any).station = itemId;
    } else {
      throw new Error(`Unsupported item kind: ${kind}`);
    }

    await music.setQueue(queueOptions);
    await music.player.play(); // Changed from music.play()
  } catch (error) {
    console.error('Error playing Apple Music item:', error);
    throw error;
  }
}

// Add other playback controls as needed: pause, skip, seek, setVolume, etc.

export async function pauseAppleMusic(): Promise<void> {
  try {
    const music = await configureMusicKit();
    await music.player.pause(); // Changed from music.pause()
  } catch (e) {
    console.error('AM pause error', e);
  }
}

export async function stopAppleMusic(): Promise<void> {
  try {
    const music = await configureMusicKit();
    await music.player.stop(); // Changed from music.stop()
  } catch (e) {
    console.error('AM stop error', e);
  }
}

// Example: Get current playback state
export async function getAppleMusicPlaybackState(): Promise<MusicKit.PlaybackStates | null> {
  try {
    const music = await configureMusicKit();
    return music.player.playbackState;
  } catch (e) {
    console.error('AM playback state error', e);
    return null;
  }
}
