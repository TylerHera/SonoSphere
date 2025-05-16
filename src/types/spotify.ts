/// <reference types="spotify-web-playback-sdk" />

// import type { AudioFeaturesObject } from 'spotify-api'; // Removed
// import type { SpotifyApi } from 'spotify-api'; // Removed

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  uri: string;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
  preview_url: string | null;
  audio_features?: SpotifyApi.AudioFeaturesObject; // Assuming global type from @types/spotify-api
}

export interface SpotifyRecommendationsParams {
  limit?: number; // 1-100, default 20
  market?: string; // ISO 3166-1 alpha-2 country code
  seed_artists?: string; // Comma-separated list of Spotify IDs
  seed_genres?: string; // Comma-separated list of genres
  seed_tracks?: string; // Comma-separated list of Spotify IDs
  // Target, Min, Max for various audio features (0.0 to 1.0 for most)
  min_acousticness?: number;
  max_acousticness?: number;
  target_acousticness?: number;
  min_danceability?: number;
  max_danceability?: number;
  target_danceability?: number;
  min_duration_ms?: number;
  max_duration_ms?: number;
  target_duration_ms?: number;
  min_energy?: number;
  max_energy?: number;
  target_energy?: number;
  min_instrumentalness?: number;
  max_instrumentalness?: number;
  target_instrumentalness?: number;
  min_key?: number; // 0-11
  max_key?: number;
  target_key?: number;
  min_liveness?: number;
  max_liveness?: number;
  target_liveness?: number;
  min_loudness?: number; // In dB, e.g., -60 to 0
  max_loudness?: number;
  target_loudness?: number;
  min_mode?: number; // 0 or 1
  max_mode?: number;
  target_mode?: number;
  min_popularity?: number; // 0-100
  max_popularity?: number;
  target_popularity?: number;
  min_speechiness?: number;
  max_speechiness?: number;
  target_speechiness?: number;
  min_tempo?: number; // In BPM
  max_tempo?: number;
  target_tempo?: number;
  min_time_signature?: number;
  max_time_signature?: number;
  target_time_signature?: number;
  min_valence?: number;
  max_valence?: number;
  target_valence?: number;
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[];
  seeds: {
    initialPoolSize: number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    id: string;
    type: 'ARTIST' | 'TRACK' | 'GENRE';
    href: string | null;
  }[];
}

// Basic artist and album types if not already defined elsewhere
export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  genres?: string[]; // Not always present
  images?: { url: string; height: number; width: number }[]; // Not always present
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Pick<SpotifyArtist, 'id' | 'name' | 'uri'>[];
  images: { url: string; height: number; width: number }[];
  uri: string;
  external_urls: {
    spotify: string;
  };
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
}

// Simplified Search Result Types (can be expanded)
export interface SpotifySearchResults {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
  };
}

// User Profile Type
export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  email?: string; // Requires user-read-email scope
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
  href: string;
  images?: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  type: 'user';
  uri: string;
  country?: string; // Requires user-read-private scope
  product?: string; // Requires user-read-private scope
}

export interface DiscoveryItem extends SpotifyTrack {
  recommendedBecause?: string; // e.g., "Similar to [Track/Artist Name]", "Popular in your region", "Matches your taste for [Genre]"
  sourceAlgorithm?:
    | 'spotify-recommendations'
    | 'custom-similarity'
    | 'content-based-vinyl'
    | 'lastfm-history';
}

export interface DiscoveryQueue {
  id: string; // Could be a timestamp or a generated UUID
  name: string; // e.g., "Upbeat Electronic Mix", "Chill Sunday Morning Vibes"
  description?: string;
  items: DiscoveryItem[];
  generatedAt: string; // ISO date string
  sourceSeeds?: {
    artists?: SpotifyArtist[];
    tracks?: SpotifyTrack[];
    genres?: string[];
  }; // To remember what generated this queue
}

// You might also want a type for saved playlists if they differ structurally
export interface SavedPlaylist extends DiscoveryQueue {
  savedAt: string; // ISO date string
  isPublic?: boolean;
  spotifyPlaylistId?: string; // If saved to Spotify
}
