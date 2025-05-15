declare namespace MusicBrainz {
  // Common Primitives
  type MBID = string; // MusicBrainz Identifier (UUID)
  type ISO_8601_Date = string; // YYYY-MM-DD, YYYY-MM, or YYYY
  type ISO_3166_1_Code = string; // Alpha-2 country code, e.g., "US"
  type LanguageCode = string; // ISO 639-3, e.g., "eng"

  interface Alias {
    name: string;
    sort_name: string;
    type?: string; // e.g., "Artist name", "Legal name"
    locale?: string;
    primary?: boolean;
    begin_date?: ISO_8601_Date;
    end_date?: ISO_8601_Date;
  }

  interface LifeSpan {
    begin?: ISO_8601_Date;
    end?: ISO_8601_Date;
    ended?: boolean;
  }

  interface Area {
    id: MBID;
    name: string;
    sort_name: string;
    disambiguation?: string;
    'iso-3166-1-codes'?: ISO_3166_1_Code[];
    type?: string; // e.g., "Country", "City"
  }

  interface Artist {
    id: MBID;
    name: string;
    sort_name: string;
    disambiguation?: string;
    type?: string; // e.g., "Person", "Group"
    gender?: string;
    country?: ISO_3166_1_Code; // Usually the primary country code
    area?: Area; // More detailed area info
    begin_area?: Area;
    end_area?: Area;
    life_span?: LifeSpan;
    aliases?: Alias[];
    score?: number; // Search result score
  }

  interface ArtistCredit {
    artist: Artist;
    name: string; // The name as credited
    joinphrase?: string; // e.g., " & ", " feat. "
  }

  interface LabelInfo {
    label: {
      id: MBID;
      name: string;
      disambiguation?: string;
      type?: string; // e.g., "Original Production", "Distributor"
    };
    catalog_number?: string;
  }

  interface MediumFormat {
    id: MBID;
    name: string; // e.g. "CD", "Vinyl", "Digital Media"
    disambiguation?: string;
  }

  interface Track {
    id: MBID; // This is Recording MBID
    number: string; // Position on the medium
    title: string;
    length?: number; // Duration in milliseconds
    recording: Recording; // Often included with `inc=recordings`
    artist_credit?: ArtistCredit[]; // If different from release artist credit
  }

  interface Medium {
    position: number;
    format?: string; // e.g., "CD", "Vinyl"
    format_id?: MBID; // Link to MediumFormat
    tracks?: Track[];
    track_count: number;
    title?: string; // e.g. "Disc 1"
  }

  interface ReleaseEvent {
    date?: ISO_8601_Date;
    area?: Area;
  }

  interface Release {
    id: MBID;
    title: string;
    status?: string; // e.g., "Official", "Promotion", "Bootleg"
    status_id?: MBID;
    quality?: string; // e.g. "normal", "high"
    disambiguation?: string;
    packaging?: string; // e.g. "Jewel Case", "Digipak"
    packaging_id?: MBID;
    date?: ISO_8601_Date; // Primary release date of this specific version
    country?: ISO_3166_1_Code; // Primary release country of this specific version
    'release-events'?: ReleaseEvent[];
    'artist-credit'?: ArtistCredit[];
    'label-info'?: LabelInfo[];
    media?: Medium[];
    'track-count'?: number; // Total tracks across all media
    'cover-art-archive'?: {
      artwork: boolean;
      count: number;
      front: boolean;
      back: boolean;
    };
    score?: number; // Search result score
    'text-representation'?: { language?: LanguageCode; script?: string };
  }

  interface ReleaseGroup {
    id: MBID;
    title: string;
    'primary-type'?: string; // e.g., "Album", "Single", "EP"
    'primary-type-id'?: MBID;
    'secondary-types'?: string[];
    'secondary-type-ids'?: MBID[];
    'first-release-date'?: ISO_8601_Date;
    disambiguation?: string;
    'artist-credit'?: ArtistCredit[];
    releases?: Release[]; // If `inc=releases`
    score?: number; // Search result score
  }

  interface Recording {
    id: MBID;
    title: string;
    length?: number; // Duration in milliseconds
    disambiguation?: string;
    'artist-credit'?: ArtistCredit[];
    'first-release-date'?: ISO_8601_Date; // Date of the earliest release containing this recording
    releases?: Release[]; // If `inc=releases`
    aliases?: Alias[];
    score?: number; // Search result score
    video?: boolean; // True if it's a video recording
  }

  // Search Response Wrappers
  interface SearchResponseHeader {
    created: string; // ISO datetime
    count: number; // Number of items in this response
    offset: number; // Starting offset of this response
    // Total number of items is usually within the specific entity list, e.g. artists.length for a simple count
    // or a field like `recording-count` on the main response object for some endpoints.
  }

  interface ArtistSearchResponse extends SearchResponseHeader {
    artists: Artist[];
  }

  interface ReleaseSearchResponse extends SearchResponseHeader {
    releases: Release[];
  }

  interface ReleaseGroupSearchResponse extends SearchResponseHeader {
    'release-groups': ReleaseGroup[];
  }

  interface RecordingSearchResponse extends SearchResponseHeader {
    recordings: Recording[];
  }

  // Cover Art Archive Types
  interface CoverArtImage {
    id: string; // usually a number as string
    image: string; // URL to full size image
    thumbnails: {
      small?: string; // URL to small thumbnail
      large?: string; // URL to large thumbnail
      '250'?: string;
      '500'?: string;
      '1200'?: string;
    };
    front: boolean;
    back: boolean;
    edit: number;
    approved: boolean;
    comment: string;
    types: string[]; // e.g. ["Front", "Medium"]
  }

  interface CoverArtResponse {
    images: CoverArtImage[];
    release: string; // URL to the release on CAA
  }
}

export {}; // Make this a module
