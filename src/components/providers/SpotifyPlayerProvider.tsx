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
  play: (uris?: string[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>; // Volume is 0.0 to 1.0
  connect: () => void;
  disconnect: () => void;
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

  const connect = useCallback(() => {
    if (player) {
      player.connect();
    }
  }, [player]);

  const disconnect = useCallback(() => {
    if (player) {
      player.disconnect();
    }
  }, [player]);

  useEffect(() => {
    if (!spotifyAccessToken) {
      if (player) disconnect();
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
            setPlayerState((prev) => ({
              ...prev,
              isActive: false,
              isPlaying: false,
              currentTrack: null,
            }));
            return;
          }
          const currentTrackChanged =
            playerState.currentTrack?.uri !==
            state.track_window.current_track.uri;
          setPlayerState((prev) => ({
            ...prev,
            isActive: true,
            isPlaying: !state.paused,
            currentTrack: state.track_window.current_track,
          }));
          // Handle scrobbling logic on state change
          if (
            currentTrackChanged ||
            (!state.paused && playerState.isPlaying !== !state.paused)
          ) {
            handleScrobbling(
              state.track_window.current_track,
              !state.paused,
              state.position,
              state.duration,
            );
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

      newPlayer.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (document.contains(script)) {
        document.body.removeChild(script);
      }
      window.onSpotifyWebPlaybackSDKReady = null; // Clean up the global callback
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyAccessToken, playerState.volume]); // Re-init if token changes or volume for init changes.

  const handleScrobbling = useCallback(
    (
      track: Spotify.Track,
      isPlaying: boolean,
      position: number,
      duration: number,
    ) => {
      if (scrobbleTimeoutRef.current) {
        clearTimeout(scrobbleTimeoutRef.current);
        scrobbleTimeoutRef.current = null;
      }

      if (!lastfmSessionKey || !track || !isPlaying) {
        return;
      }

      // Update Now Playing
      lastfmUpdateNowPlaying(
        track.artists[0].name,
        track.name,
        lastfmSessionKey,
        track.album.name,
        track.album.artists?.[0]?.name || track.artists[0].name, // Album artist if available
        Math.floor(duration / 1000),
      ).then((response) => {
        if ('error' in response)
          toast.error(`Last.fm Now Playing Error: ${response.message}`);
      });

      // Set timeout for scrobbling
      // Don't scrobble if already scrobbled or track is too short
      if (lastTrackScrobbledRef.current === track.uri || duration < 30000) {
        // Less than 30s
        return;
      }

      const timeToScrobble =
        Math.min(duration * SCROBBLE_PERCENTAGE, SCROBBLE_MAX_TIME) - position;
      if (timeToScrobble > 0) {
        scrobbleTimeoutRef.current = setTimeout(() => {
          const currentTimestamp =
            Math.floor(Date.now() / 1000) - Math.floor(duration / 1000); // Timestamp when track started
          lastfmScrobbleTrack(
            track.artists[0].name,
            track.name,
            currentTimestamp,
            lastfmSessionKey,
            track.album.name,
            track.album.artists?.[0]?.name || track.artists[0].name,
            Math.floor(duration / 1000),
          ).then((response) => {
            if ('error' in response) {
              toast.error(`Last.fm Scrobble Error: ${response.message}`);
            } else if (response.scrobbles['@attr'].accepted > 0) {
              toast.success(`Scrobbled: ${track.name}`);
              lastTrackScrobbledRef.current = track.uri;
            }
          });
        }, timeToScrobble);
      }
    },
    [lastfmSessionKey],
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
  const play = async (uris?: string[]) => {
    if (!player || !playerState.deviceId || !spotifyAccessToken) return;
    // To start playback on a new device, we might need to transfer playback first
    // This is often handled by Spotify Connect UI or specific API calls if needed.
    // For simplicity, assuming playback transfer is handled or current device is active.
    await player.activateElement(); // Ensure the player is active, might not be needed with connect()

    const options: Spotify.PlayOptions = { device_id: playerState.deviceId };
    if (uris && uris.length > 0) {
      options.uris = uris;
    }

    // If the player is already playing and uris are provided, it will play the new uris.
    // If no uris are provided and it was paused, it resumes.
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${playerState.deviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ uris }), // uris can be undefined to resume
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${spotifyAccessToken}`,
          },
        },
      );
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    } catch (e) {
      console.error('Failed to play', e);
    }
  };

  const pause = async () => {
    if (player) {
      await player.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const resume = async () => {
    if (player || !spotifyAccessToken) {
      // Re-using play function for resume. Spotify API handles resume if uris is undefined.
      await play();
    }
  };

  const nextTrack = async () => {
    if (player) await player.nextTrack();
  };

  const previousTrack = async () => {
    if (player) await player.previousTrack();
  };

  const seek = async (positionMs: number) => {
    if (player) await player.seek(positionMs);
  };

  const setVolumeCallback = async (newVolume: number) => {
    if (player) {
      await player.setVolume(newVolume);
      setPlayerState((prev) => ({ ...prev, volume: newVolume }));
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
        connect,
        disconnect,
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
