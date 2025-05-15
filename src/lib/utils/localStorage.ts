const APP_PREFIX = 'sonosphere_';

/**
 * Gets an item from localStorage with app prefix.
 * Automatically parses JSON if possible.
 */
export function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(APP_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    // Fallback for non-JSON strings, though we intend to store JSON primarily
    const item = window.localStorage.getItem(APP_PREFIX + key);
    return item as T | null;
  }
}

/**
 * Sets an item in localStorage with app prefix.
 * Automatically stringifies JSON objects.
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(APP_PREFIX + key, item);
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Removes an item from localStorage with app prefix.
 */
export function removeLocalStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(APP_PREFIX + key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}

// Specific keys for smart resume
const PLAYBACK_POSITION_KEY_PREFIX = 'playback_position_';

export interface PlaybackPosition {
  trackId: string; // A unique identifier for the track (e.g., spotify_uri, apple_music_id, youtube_video_id)
  positionMs: number;
  durationMs?: number; // Optional, but useful for UI or deciding if resume is near end
  timestamp: number; // When this position was saved
  source: 'spotify' | 'appleMusic' | 'youtube' | string; // Playback source
}

/**
 * Saves playback position for a specific track and user.
 * userId is used to namespace the key further if needed, or can be part of trackId itself if globally unique.
 */
export function savePlaybackPosition(
  userId: string,
  source: string,
  trackId: string,
  positionMs: number,
  durationMs?: number,
) {
  const key = `${PLAYBACK_POSITION_KEY_PREFIX}${userId}_${source}_${trackId}`;
  const data: PlaybackPosition = {
    trackId,
    positionMs,
    durationMs,
    timestamp: Date.now(),
    source,
  };
  setLocalStorageItem(key, data);
}

/**
 * Retrieves playback position for a specific track and user.
 */
export function getPlaybackPosition(
  userId: string,
  source: string,
  trackId: string,
): PlaybackPosition | null {
  const key = `${PLAYBACK_POSITION_KEY_PREFIX}${userId}_${source}_${trackId}`;
  const data = getLocalStorageItem<PlaybackPosition>(key);
  // Optional: Could add logic here to expire old saved positions, e.g., if timestamp is too old.
  return data;
}

/**
 * Clears playback position for a specific track and user.
 */
export function clearPlaybackPosition(
  userId: string,
  source: string,
  trackId: string,
) {
  const key = `${PLAYBACK_POSITION_KEY_PREFIX}${userId}_${source}_${trackId}`;
  removeLocalStorageItem(key);
}
