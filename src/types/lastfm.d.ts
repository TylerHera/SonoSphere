declare namespace LastFM {
  interface Image {
    size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | '';
    '#text': string;
  }

  interface Artist {
    mbid?: string;
    '#text': string;
  }

  interface Album {
    mbid?: string;
    '#text': string;
  }

  interface Date {
    uts: string;
    '#text': string;
  }

  interface TrackAttr {
    nowplaying?: 'true' | 'false';
    rank?: string; // For top tracks, not in recent
  }

  interface RecentTrack {
    artist: Artist;
    streamable: '0' | '1';
    image: Image[];
    mbid: string;
    album: Album;
    name: string;
    '@attr'?: TrackAttr; // Optional: only present for nowplaying track in recenttracks
    url: string;
    date?: Date; // Optional: not present for nowplaying track
    loved?: '0' | '1';
  }

  interface RecentTracksAttr {
    user: string;
    totalPages: string;
    page: string;
    perPage: string;
    total: string;
  }

  interface RecentTracks {
    track: RecentTrack[];
    '@attr': RecentTracksAttr;
  }

  interface RecentTracksResponse {
    recenttracks: RecentTracks;
  }

  interface ErrorResponse {
    error: number;
    message: string;
  }

  interface Session {
    name: string;
    key: string;
    subscriber: '0' | '1';
  }

  interface SessionResponse {
    session: Session;
  }

  // Simplified response for now playing, actual can be more complex
  interface NowPlayingTrackInfo {
    corrected: string; // "0" or "1"
    '#text': string;
  }
  interface NowPlayingScrobbles {
    artist: NowPlayingTrackInfo;
    album: NowPlayingTrackInfo;
    albumArtist: NowPlayingTrackInfo;
    track: NowPlayingTrackInfo;
    ignoredMessage: { code: string; '#text': string };
  }
  interface UpdateNowPlayingResponse {
    nowplaying: NowPlayingScrobbles;
  }

  // Scrobble response types
  interface Scrobble {
    track: NowPlayingTrackInfo;
    artist: NowPlayingTrackInfo;
    album: NowPlayingTrackInfo;
    albumArtist: NowPlayingTrackInfo;
    timestamp: string;
    ignoredMessage: { code: string; '#text': string };
  }

  interface ScrobblesInfoAttr {
    accepted: number;
    ignored: number;
  }

  interface ScrobblesInfo {
    scrobble: Scrobble[]; // For batch, this is an array. For single, it might be an object.
    // Assuming it can be an array even for one for consistency from API docs.
    '@attr': ScrobblesInfoAttr;
  }

  interface ScrobbleResponse {
    scrobbles: ScrobblesInfo;
  }

  // General type for API responses that might be an error
  type ApiResponse<T> = T | ErrorResponse;
}
