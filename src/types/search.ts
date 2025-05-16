// src/types/search.ts

export type SearchResultSource =
  | 'spotify'
  | 'appleMusic'
  | 'discogs'
  | 'youtube'
  | 'musicbrainz'
  | 'internal'; // 'internal' for local DB search

export interface BaseSearchResult {
  id: string; // Unique ID from the source
  source: SearchResultSource;
  title: string;
  artist?: string;
  album?: string;
  year?: number | string;
  imageUrl?: string;
  url?: string; // Link to the item on the source platform
  type: 'track' | 'album' | 'artist' | 'playlist' | 'video' | 'releaseGroup'; // Type of item
}

// Specific types can extend BaseSearchResult if needed, e.g.:
export interface SpotifyTrackSearchResult extends BaseSearchResult {
  source: 'spotify';
  type: 'track';
  spotifyUri: string;
  durationMs?: number;
}

export interface AppleMusicTrackSearchResult extends BaseSearchResult {
  source: 'appleMusic';
  type: 'track';
  appleMusicId: string; // or playbackId
  durationInMillis?: number;
}

export interface DiscogsReleaseSearchResult extends BaseSearchResult {
  source: 'discogs';
  type: 'album' | 'track'; // Discogs search can return master releases, releases, or tracks
  discogsReleaseId?: number;
  discogsMasterId?: number;
  thumb?: string;
  country?: string;
  catno?: string;
  formats?: { name: string; qty: string; descriptions?: string[] }[];
}

// Add more specific types as needed for YouTube, MusicBrainz, etc.

export type UnifiedSearchResult =
  | BaseSearchResult
  | SpotifyTrackSearchResult
  | AppleMusicTrackSearchResult
  | DiscogsReleaseSearchResult; // Union of all possible types

export interface AggregatedSearchResults {
  query: string;
  results: UnifiedSearchResult[];
  // countsBySource?: Record<SearchResultSource, number>; // Optional: for UI display
  errors?: Partial<Record<SearchResultSource, string>>; // Changed to Partial
}
