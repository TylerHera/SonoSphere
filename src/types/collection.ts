import { MusicBrainz } from './musicbrainz';

// Corresponds to the Prisma model VinylItem from the backend
// and the PRD definition.
export interface VinylItem {
  id: string; // Typically UUID from the database
  user_id: string;
  discogs_id?: number | null;
  title: string;
  artist_main: string;
  artists_extra?: { name: string; join?: string }[] | null; // JSONB in Prisma
  release_title?: string | null;
  year?: number | null;
  formats?: { name: string; qty: string; descriptions?: string[] }[] | null; // JSONB in Prisma
  labels?: { name: string; catno?: string }[] | null; // JSONB in Prisma
  genres?: string[] | null; // text[] in Prisma
  styles?: string[] | null; // text[] in Prisma
  cover_url_small?: string | null;
  cover_url_large?: string | null;
  status?: 'OWNED' | 'WISHLIST' | 'SOLD' | 'OTHER' | null; // Matches VinylItemStatus enum
  added_at: string; // ISO DateTime string
  notes?: string | null;
  custom_tags?: string[] | null; // text[] in Prisma
  folder?: string | null; // Added in Phase 1.4

  // Optional fields that might be populated from joins or other sources
  musicbrainz_release_id?: MusicBrainz.MBID | null;
  last_played_at?: string | null; // ISO DateTime string
  play_count?: number | null;
}

// This type can be used for items fetched specifically for the user's local collection view,
// potentially with more frontend-specific transformations or less detail than full VinylItem if needed.
export type LocalCollectionItem = VinylItem & {
  // any additional frontend-specific properties can go here
  // for example, if we denormalize some MusicBrainz info directly onto the item for display
  primary_release_date_from_mb?: string | null;
  cover_art_from_mb?: string | null;
};

export interface CollectionSortOption {
  value: string;
  label: string;
}

export interface CollectionFilters {
  status?: string;
  search?: string;
  genre?: string;
  folder?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 