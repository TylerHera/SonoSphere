declare namespace Musixmatch {
  interface TrackIdentifierParams {
    track_name?: string;
    artist_name?: string;
    album_name?: string;
    track_mbid?: string; // MusicBrainz Track ID
    // Musixmatch also supports ISRC, Spotify ID, etc.
  }

  interface TrackSearchResultItem {
    track_id: number;
    track_name: string;
    artist_name: string;
    album_name?: string;
    track_length?: number; // in seconds
    has_lyrics: 0 | 1;
    has_subtitles: 0 | 1; // Subtitles usually mean synchronized lyrics
    // ... other fields like instrumental, explicit, etc.
  }

  interface TrackSearchResponse {
    message: {
      header: {
        status_code: number;
        execute_time: number;
        available: number;
      };
      body: {
        track_list: { track: TrackSearchResultItem }[];
      };
    };
  }

  interface LyricsLine {
    text: string;
    time: {
      // Time in seconds, e.g., total: 123.45 (seconds.milliseconds)
      total: number;
      minutes: number;
      seconds: number;
      hundredths: number; // or milliseconds
    };
  }

  interface SynchronizedLyrics {
    lyrics_id: number;
    lyrics_body: string; // Can be plain text or LRC format string
    script_tracking_url?: string;
    pixel_tracking_url?: string;
    lyrics_copyright: string;
    // If API provides parsed LRC or structured lines:
    subtitle_body?: LyricsLine[]; // Or a similar structure for LRC content
  }

  interface LyricsResponse {
    message: {
      header: {
        status_code: number;
        execute_time: number;
      };
      body: {
        lyrics?: SynchronizedLyrics; // For track.lyrics.get
        subtitle?: SynchronizedLyrics; // For track.subtitle.get (often preferred for sync)
      };
    };
  }

  interface ErrorResponse {
    message: {
      header: {
        status_code: number;
        hint?: string; // e.g., "Usage limit reached"
      };
      body: string | object; // Error details might be a string or an empty object
    };
  }

  type ApiResponse<T> = T | ErrorResponse;
}

export {}; // Makes this a module
