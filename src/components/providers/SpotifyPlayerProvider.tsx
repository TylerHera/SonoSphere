'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { useAuth, AuthContextType } from './AuthProvider'; // Assuming AuthProvider gives access to Supabase session
import { createClient } from '@/lib/supabase/client';
import {
  updateNowPlaying as lastfmUpdateNowPlaying,
  scrobbleTrack as lastfmScrobbleTrack,
} from '@/lib/api/lastfm';
import { toast } from 'sonner';
import {
  savePlaybackPosition,
  getPlaybackPosition,
  clearPlaybackPosition,
  PlaybackPosition,
} from '@/lib/utils/localStorage'; // Import localStorage utilities

interface SpotifyPlayerState {
  deviceId: string | null;
  isReady: boolean;
  isActive: boolean;
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  volume: number;
  // Add more state properties as needed: progress, shuffle, repeat, etc.
}

interface SpotifyPlayerContextType extends SpotifyPlayerState {
  player: Spotify.Player | null;
  play: (contextUri?: string, uris?: string[]) => Promise<void>; // Added contextUri
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>; // Volume is 0.0 to 1.0
  connect: () => void;
  disconnectPlayer: () => void; // Renamed from disconnect for clarity
  session: AuthContextType['session'];
}

const SpotifyPlayerContext = createContext<
  SpotifyPlayerContextType | undefined
>(undefined);

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

const SCROBBLE_PERCENTAGE = 0.5; // Scrobble after 50% played
const SCROBBLE_MAX_TIME = 4 * 60 * 1000; // Or after 4 minutes

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({
  children,
}) => {
  const { session, user } = useAuth(); // Get Supabase session which should contain provider_token for Spotify
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    deviceId: null,
    isReady: false,
    isActive: false,
    isPlaying: false,
    currentTrack: null,
    volume: 0.5, // Default volume
  });
  const [lastfmSessionKey, setLastfmSessionKey] = useState<string | null>(null);
  const scrobbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackScrobbledRef = useRef<string | null>(null); // URI of last scrobbled track
  const previousTrackUriRef = useRef<string | null>(null); // For smart resume
  const seekAfterReadyRef = useRef<number | null>(null); // For seeking after track is ready

  const spotifyAccessToken = session?.provider_token;

  // Fetch Last.fm session key
  useEffect(() => {
    const fetchLastfmKey = async () => {
      if (user && !lastfmSessionKey) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('lastfm_session_key')
          .eq('id', user.id)
          .single();
        if (data?.lastfm_session_key) {
          setLastfmSessionKey(data.lastfm_session_key);
        }
      }
    };
    fetchLastfmKey();
  }, [user, lastfmSessionKey]);

  const connectPlayer = useCallback(() => {
    if (player) {
      player.connect().then(success => {
        if (success) console.log("Spotify Player connected to SDK.");
        else console.error("Failed to connect Spotify Player to SDK.");
      });
    }
  }, [player]);

  const disconnectPlayer = useCallback(() => {
    if (player) {
      // Save current position before disconnecting
      if (user && playerState.currentTrack && playerState.isActive) {
        player.getCurrentState().then(state => {
          if (state) {
            savePlaybackPosition(
              user.id,
              'spotify',
              state.track_window.current_track.uri,
              state.position,
              state.duration,
            );
            console.log("Saved position on disconnect:", state.track_window.current_track.name, state.position);
          }
        });
      }
      player.disconnect();
      console.log("Spotify Player disconnected from SDK.");
    }
  }, [player, user, playerState.currentTrack, playerState.isActive]);

  useEffect(() => {
    if (!spotifyAccessToken) {
      if (player) disconnectPlayer(); // Use the new disconnectPlayer
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'SonoSphere Web Player',
        getOAuthToken: (cb) => {
          cb(spotifyAccessToken);
        },
        volume: playerState.volume,
      });

      setPlayer(newPlayer);

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player Ready with Device ID', device_id);
        setPlayerState((prev) => ({
          ...prev,
          deviceId: device_id,
          isReady: true,
        }));
      });

      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setPlayerState((prev) => ({
          ...prev,
          deviceId: device_id,
          isReady: false,
          isActive: false,
        }));
      });

      newPlayer.addListener(
        'player_state_changed',
        (state: Spotify.PlaybackState | null) => {
          if (!state) {
             // If player becomes inactive, save position of the last known track
            if (user && playerState.currentTrack && playerState.isActive) {
                savePlaybackPosition(
                  user.id,
                  'spotify',
                  playerState.currentTrack.uri,
                  0, // Placeholder
                  playerState.currentTrack.duration_ms,
                );
                console.log("Player became inactive, attempted to save position for:", playerState.currentTrack?.name);
            }
            setPlayerState((prev) => ({
              ...prev,
              isActive: false,
              isPlaying: false,
              currentTrack: null,
            }));
            previousTrackUriRef.current = null; // Reset previous track on inactivity
            return;
          }

          const newTrack = state.track_window.current_track;
          
          // Add a null check for newTrack, though typically guaranteed by SDK if state is not null.
          if (!newTrack) {
            console.error("Spotify player_state_changed: newTrack is null, though state is not. This is unexpected.");
            // Potentially set player to inactive or handle error appropriately
            setPlayerState((prev) => ({
              ...prev,
              isActive: false,
              isPlaying: false,
              currentTrack: null,
            }));
            return;
          }

          const oldTrack = playerState.currentTrack;
          const currentTrackUri = newTrack.uri; // Assumes newTrack is valid and has uri
          const position = state.position;
          const duration = state.duration;
          const isPaused = state.paused;

          setPlayerState((prev) => ({
            ...prev,
            isActive: true,
            isPlaying: !isPaused,
            currentTrack: newTrack,
          }));
          
          if (user) {
            // Track Change Logic for Smart Resume
            if (currentTrackUri !== previousTrackUriRef.current) {
              if (previousTrackUriRef.current) {
                clearPlaybackPosition(user.id, 'spotify', previousTrackUriRef.current);
                console.log("Cleared position for previous track:", previousTrackUriRef.current);
              }
              previousTrackUriRef.current = currentTrackUri;

              const savedPositionData = getPlaybackPosition(user.id, 'spotify', currentTrackUri);
              if (savedPositionData && savedPositionData.positionMs > 0 && savedPositionData.positionMs < duration - 5000) { // -5s to avoid seeking to very end
                console.log(`Found saved position for ${newTrack?.name}: ${savedPositionData.positionMs}ms. Seeking.`);
                newPlayer.seek(savedPositionData.positionMs).catch(console.error);
              } else {
                 console.log(`No valid saved position, or starting from beginning for:`, newTrack?.name);
              }
            }

            // Save position on pause
            if (isPaused) {
              savePlaybackPosition(user.id, 'spotify', currentTrackUri, position, duration);
              console.log("Saved position on pause:", newTrack?.name, position);
            }
          }

          if (oldTrack?.uri !== newTrack.uri || playerState.isPlaying !== !isPaused) {
            // Pass newTrack here; it's confirmed non-null above.
            handleScrobbling(newTrack, !isPaused, position, duration);
          }
        },
      );

      newPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize Spotify Player', message);
      });
      newPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate Spotify Player', message);
        // Potentially trigger re-auth or notify user
      });
      newPlayer.addListener('account_error', ({ message }) => {
        console.error('Spotify Player account error', message);
        // E.g. premium required
      });

      newPlayer.connect().then(success => {
          if(success) console.log("Spotify Player SDK connected successfully after setup.");
          else console.error("Spotify Player SDK failed to connect after setup.");
      });
    };

    // Cleanup function
    return () => {
      if (player) {
         // Save position of current track before disconnecting player instance
        if (user && playerState.currentTrack && playerState.isActive) {
            player.getCurrentState().then(state => {
                if(state) {
                    savePlaybackPosition(
                        user.id,
                        'spotify',
                        state.track_window.current_track.uri,
                        state.position,
                        state.duration
                    );
                     console.log("Saved position on component unmount/cleanup for:", state.track_window.current_track.name, state.position);
                }
            }).catch(e => console.warn("Could not get current state on unmount to save position", e));
        }
        player.disconnect(); // Disconnect the Spotify Player instance
        setPlayer(null); // Nullify player state
        console.log("Spotify Player instance disconnected and cleaned up.");
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      window.onSpotifyWebPlaybackSDKReady = () => {}; // Assign an empty function
      previousTrackUriRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyAccessToken, playerState.volume, user]); // user dependency for smart resume

  const handleScrobbling = useCallback(
    (
      track: Spotify.Track,
      isPlaying: boolean,
      position: number,
      duration: number,
    ) => {
      const currentTimeoutId = scrobbleTimeoutRef.current;
      if (currentTimeoutId !== null) {
        clearTimeout(currentTimeoutId);
        scrobbleTimeoutRef.current = null;
      }

      if (!lastfmSessionKey || !track || !isPlaying || !user) {
        return;
      }

      const primaryTrackArtistName = track.artists?.[0]?.name;
      const trackAlbum = track.album as Spotify.Album & { artists?: Spotify.Artist[] }; // Type assertion
      const albumDisplayName = trackAlbum?.name || 'Unknown Album';

      if (!primaryTrackArtistName) {
        console.warn("Track has no primary artist name, skipping Last.fm update/scrobble for:", track.name);
        return;
      }
      
      const albumArtistName = trackAlbum?.artists?.[0]?.name || primaryTrackArtistName;

      if (lastTrackScrobbledRef.current === track.uri || duration < 30000) {
        return; 
      }

      lastfmUpdateNowPlaying(
        primaryTrackArtistName,
        track.name,
        lastfmSessionKey,
        albumDisplayName,
        albumArtistName,
        Math.floor(duration / 1000),
      ).then((response) => {
        if ('error' in response)
          toast.error(`Last.fm Now Playing Error: ${response.message}`);
      });

      const timeToScrobble =
        Math.min(duration * SCROBBLE_PERCENTAGE, SCROBBLE_MAX_TIME) - position;
        
      if (timeToScrobble > 0) {
        scrobbleTimeoutRef.current = setTimeout(() => {
          const currentTimestamp =
            Math.floor(Date.now() / 1000) - Math.floor(position / 1000);
          lastfmScrobbleTrack(
            primaryTrackArtistName,
            track.name,
            currentTimestamp,
            lastfmSessionKey,
            albumDisplayName,
            albumArtistName,
            Math.floor(duration / 1000),
          ).then((response) => {
            if ('error' in response) {
              toast.error(`Last.fm Scrobble Error: ${response.message}`);
            } else {
              toast.success(`Scrobbled to Last.fm: ${track.name}`);
              lastTrackScrobbledRef.current = track.uri;
            }
          });
        }, timeToScrobble);
      }
    },
    [lastfmSessionKey, user],
  );

  // Reset scrobble ref if track changes significantly
  useEffect(() => {
    if (
      playerState.currentTrack?.uri !== lastTrackScrobbledRef.current &&
      playerState.currentTrack
    ) {
      lastTrackScrobbledRef.current = null;
    }
  }, [playerState.currentTrack]);

  // Player control functions
  const play = async (contextUri?: string, uris?: string[]) => {
    if (!player || !playerState.deviceId) {
      console.warn('Spotify Player not ready or no device ID.');
      toast.error("Spotify player is not ready. Please select it from Spotify devices list.");
      return;
    }
    // When explicitly playing, clear any saved position for this context/uris
    // This might be too aggressive if user wants to resume a playlist.
    // For now, explicit play starts fresh or Spotify SDK handles playlist resume.
    // Smart resume will primarily apply to automatic continuation or re-opening the app.

    // If the intention is to resume the *current* track, the `resume` method should be used.
    // This `play` method is more for starting new playback.
    // The `player_state_changed` listener will handle `getPlaybackPosition` for the new track.
    try {
      await player.activateElement(); // Ensure player is active
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${playerState.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
        body: JSON.stringify({
          uris: uris, // Play specific tracks
          context_uri: contextUri, // Play a context like album/playlist
          // position_ms: undefined // Let player_state_changed handle resume
        }),
      });
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error playing track(s):', error);
      toast.error("Failed to play track(s) on Spotify.");
    }
  };

  const pause = async () => {
    if (player) {
      try {
        await player.pause();
        // Position saving is handled by player_state_changed on pause
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      } catch (error) {
        console.error('Error pausing track:', error);
      }
    }
  };

  const resume = async () => {
    if (player) {
      try {
        await player.resume();
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      } catch (error) {
        console.error('Error resuming track:', error);
      }
    }
  };

  const nextTrack = async () => {
    if (player) {
       if (user && playerState.currentTrack) { // Clear current track's saved position on explicit skip
         clearPlaybackPosition(user.id, 'spotify', playerState.currentTrack.uri);
       }
      await player.nextTrack();
    }
  };

  const previousTrack = async () => {
    if (player) {
      if (user && playerState.currentTrack) { // Clear current track's saved position
         clearPlaybackPosition(user.id, 'spotify', playerState.currentTrack.uri);
       }
      await player.previousTrack();
    }
  };

  const seek = async (positionMs: number) => {
    if (player) {
      await player.seek(positionMs);
    }
  };

  const setVolumeCallback = async (newVolume: number) => {
    if (player) {
      await player.setVolume(newVolume);
      setPlayerState(prev => ({ ...prev, volume: newVolume }));
    }
  };

  return (
    <SpotifyPlayerContext.Provider
      value={{
        ...playerState,
        player,
        play,
        pause,
        resume,
        nextTrack,
        previousTrack,
        seek,
        setVolume: setVolumeCallback,
        connect: connectPlayer,
        disconnectPlayer,
        session,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (context === undefined) {
    throw new Error(
      'useSpotifyPlayer must be used within a SpotifyPlayerProvider',
    );
  }
  return context;
};
