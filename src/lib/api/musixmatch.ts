const API_BASE_URL = 'https://api.musixmatch.com/ws/1.1/';
const API_KEY = process.env.NEXT_PUBLIC_MUSIXMATCH_API_KEY;

interface BaseParams {
  apikey: string;
  format?: 'json' | 'xml';
  callback?: string; // for jsonp
}

const musixmatchApiRequest = async <T = any>(
  method: string,
  params: Record<string, string | number | undefined>,
): Promise<Musixmatch.ApiResponse<T>> => {
  if (!API_KEY) {
    console.error('Musixmatch API Key not configured.');
    // Simulate Musixmatch error structure for consistency
    return {
      message: {
        header: { status_code: 401, hint: 'Authentication failed, missing API key' },
        body: ''
      }
    } as Musixmatch.ErrorResponse;
  }

  const allParams: BaseParams & Record<string, string | number | undefined> = {
    ...params,
    apikey: API_KEY,
    format: 'json',
  };

  const queryString = new URLSearchParams(
    Object.entries(allParams).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  try {
    const response = await fetch(`${API_BASE_URL}${method}?${queryString}`);
    const data = await response.json();

    // Musixmatch API often wraps success and error in a `message` object
    if (data.message.header.status_code !== 200) {
      console.warn(`Musixmatch API error (${data.message.header.status_code}):`, data.message.body || data.message.header.hint);
      return data as Musixmatch.ErrorResponse;
    }
    return data as T;
  } catch (error) {
    console.error('Musixmatch API request failed:', error);
    return {
      message: {
        header: { status_code: 500, hint: 'Network or parsing error' },
        body: ''
      }
    } as Musixmatch.ErrorResponse;
  }
};

/**
 * Searches for tracks on Musixmatch.
 * @param queryParams Parameters to identify the track (e.g., track_name, artist_name).
 * @param page Page number for results.
 * @param pageSize Number of results per page.
 * @param hasLyricsOnly Filter for tracks that have lyrics (1 for true, 0 for false).
 */
export const searchMusixmatchTrack = async (
  queryParams: Musixmatch.TrackIdentifierParams,
  page: number = 1,
  pageSize: number = 5,
  hasLyricsOnly: 0 | 1 = 1, 
): Promise<Musixmatch.ApiResponse<Musixmatch.TrackSearchResponse>> => {
  return musixmatchApiRequest<Musixmatch.TrackSearchResponse>('track.search', {
    q_track: queryParams.track_name,
    q_artist: queryParams.artist_name,
    q_album: queryParams.album_name,
    // f_has_lyrics: hasLyricsOnly, // Prioritize tracks with lyrics
    // f_has_subtitles: 1, // Prioritize tracks with synced lyrics
    s_track_rating: 'desc', // Sort by track popularity
    s_artist_rating: 'desc',
    page_size: pageSize,
    page: page,
    // Other params like track_mbid can be added if available
  });
};

/**
 * Fetches synchronized lyrics for a given Musixmatch track ID.
 * Prefers subtitle (synchronized) lyrics if available.
 * @param trackId The Musixmatch track ID.
 */
export const getMusixmatchSynchronizedLyrics = async (
  trackId: number,
): Promise<Musixmatch.ApiResponse<Musixmatch.LyricsResponse>> => {
  // Musixmatch usually provides synchronized lyrics via track.subtitle.get
  // track.lyrics.get might return unsynchronized lyrics or LRC format in lyrics_body.
  return musixmatchApiRequest<Musixmatch.LyricsResponse>('track.subtitle.get', {
    track_id: trackId,
  });
};

/**
 * Fetches (potentially unsynchronized) lyrics for a given Musixmatch track ID.
 * This can be a fallback if synchronized lyrics are not found.
 * @param trackId The Musixmatch track ID.
 */
export const getMusixmatchLyrics = async (
  trackId: number,
): Promise<Musixmatch.ApiResponse<Musixmatch.LyricsResponse>> => {
    return musixmatchApiRequest<Musixmatch.LyricsResponse>('track.lyrics.get', {
        track_id: trackId,
    });
}; 