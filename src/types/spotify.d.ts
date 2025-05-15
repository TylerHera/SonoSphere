// Type definitions for Spotify Web Playback SDK
// Based on https://developer.spotify.com/documentation/web-playback-sdk/reference/

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: {
            Player: typeof Spotify.Player;
        };
    }
}

declare namespace Spotify {
    interface Entity {
        name: string;
        uri: string;
        url: string;
    }

    interface Album {
        name: string;
        uri: string;
        images: Image[];
    }

    interface Artist {
        name: string;
        uri: string;
    }

    interface Image {
        height?: number | null | undefined;
        url: string;
        width?: number | null | undefined;
    }

    interface PlaybackContextTrack extends Entity {
        artists: Artist[];
        id: string | null;
        type: 'track' | 'episode' | 'ad';
        media_type: 'audio' | 'video';
        is_playable: boolean;
        is_local: boolean;
        album: Album;
        linked_from?: PlaybackContextTrack | undefined;
    }

    interface Track extends PlaybackContextTrack {
        duration_ms: number;
    }

    interface PlaybackDisallows {
        pausing?: boolean;
        peeking_next?: boolean;
        peeking_prev?: boolean;
        resuming?: boolean;
        seeking?: boolean;
        skipping_next?: boolean;
        skipping_prev?: boolean;
    }

    interface PlaybackRestrictions {
        disallow_pausing_reasons?: string[];
        disallow_peeking_next_reasons?: string[];
        disallow_peeking_prev_reasons?: string[];
        disallow_resuming_reasons?: string[];
        disallow_seeking_reasons?: string[];
        disallow_skipping_next_reasons?: string[];
        disallow_skipping_prev_reasons?: string[];
    }

    interface PlaybackState {
        context: {
            uri: string | null; // The URI of the context (e.g. playlist, album)
            metadata: any | null; // Additional metadata for the context (e.g. playlist name)
        };
        disallows: PlaybackDisallows;
        duration: number;
        paused: boolean;
        position: number;
        repeat_mode: 0 | 1 | 2; // 0 = no repeat, 1 = context repeat, 2 = track repeat
        shuffle: boolean;
        restrictions: PlaybackRestrictions;
        track_window: {
            current_track: Track;
            previous_tracks: Track[];
            next_tracks: Track[];
        };
        timestamp: number;
        playback_id: string;
        playback_quality: string;
        playback_features: {
            hifi_status: string;
        };
    }

    interface PlayOptions {
        device_id?: string;
        uris?: string[];
        position_ms?: number;
    }

    interface PlayerInit {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number | undefined;
        enableMediaSession?: boolean | undefined;
    }

    class Player {
        constructor(options: PlayerInit);

        connect(): Promise<boolean>;
        disconnect(): void;
        getCurrentState(): Promise<PlaybackState | null>;
        getVolume(): Promise<number>;
        nextTrack(): Promise<void>;
        pause(): Promise<void>;
        previousTrack(): Promise<void>;
        resume(): Promise<void>;
        seek(position_ms: number): Promise<void>;
        setVolume(volume: number): Promise<void>;
        activateElement(): Promise<void>;

        addListener(event: 'ready' | 'not_ready', cb: (device: { device_id: string }) => void): void;
        addListener(event: 'player_state_changed', cb: (state: PlaybackState | null) => void): void;
        addListener(
            event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error',
            cb: (error: Error & { message: string }) => void,
        ): void;
        on: Player['addListener']; // Alias for addListener

        removeListener(event: 'ready' | 'not_ready' | 'player_state_changed' | 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error', cb?: (...args: any[]) => void): void;
    }
} 