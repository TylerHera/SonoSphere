import md5 from 'crypto-js/md5';

const API_KEY = process.env.LASTFM_API_KEY;
const SHARED_SECRET = process.env.LASTFM_SHARED_SECRET;
const API_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface RequestParams {
  [key: string]: string | number | undefined;
}

// Function to generate API signature
const generateApiSignature = (
  params: Record<string, string | number>,
): string => {
  const keys = Object.keys(params).sort();
  let sigString = '';
  keys.forEach((key) => {
    if (key !== 'format' && key !== 'callback') {
      // format & callback are not part of sig
      sigString += key + params[key];
    }
  });
  sigString += SHARED_SECRET;
  return md5(sigString).toString();
};

const lastfmApiRequest = async <T = any>(
  params: RequestParams,
  isSigned: boolean = false,
  httpMethod: 'GET' | 'POST' = 'GET',
): Promise<T | LastFM.ErrorResponse> => {
  if (!API_KEY || (isSigned && !SHARED_SECRET)) {
    console.error('Last.fm API Key or Shared Secret not configured.');
    return {
      error: 0,
      message: 'API credentials not configured',
    } as LastFM.ErrorResponse;
  }

  const allParams: RequestParams = {
    ...params,
    api_key: API_KEY,
    format: 'json',
  };

  if (isSigned && !allParams.method) {
    console.error('Method is required for signed Last.fm API calls.');
    return {
      error: 0,
      message: 'Method required for signing',
    } as LastFM.ErrorResponse;
  }

  const searchParams = new URLSearchParams();
  for (const key in allParams) {
    if (allParams[key] !== undefined) {
      searchParams.append(key, String(allParams[key]));
    }
  }

  try {
    let response;
    if (httpMethod === 'POST') {
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: searchParams.toString(),
      });
    } else {
      // GET
      response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`);
    }

    if (!response.ok) {
      console.error(
        'Last.fm API Error:',
        response.status,
        await response.text(),
      );
      return {
        error: response.status,
        message: `HTTP error! status: ${response.status}`,
      } as LastFM.ErrorResponse;
    }
    const data = await response.json();
    if (data.error) {
      console.warn('Last.fm API returned error:', data.message);
      return data as LastFM.ErrorResponse;
    }
    return data as T;
  } catch (error) {
    console.error('Last.fm API request failed:', error);
    return {
      error: 0,
      message: 'Network or parsing error',
    } as LastFM.ErrorResponse;
  }
};

// 1. Get a request token (not directly used here, auth flow starts with user redirect)
// export const getAuthToken = async (): Promise<LastFM.AuthTokenResponse | LastFM.ErrorResponse> => {
//   return lastfmApiRequest<LastFM.AuthTokenResponse>({ method: 'auth.getToken' }, true);
// };

// Step 1 of auth: Redirect user to Last.fm authorization page
export const getAuthorizationUrl = (callbackUrl: string): string => {
  return `https://www.last.fm/api/auth/?api_key=${API_KEY}&cb=${encodeURIComponent(callbackUrl)}`;
};

// Step 2 of auth: Get a session using the token granted after user authorization
export const getSession = async (
  token: string,
): Promise<LastFM.SessionResponse | LastFM.ErrorResponse> => {
  return lastfmApiRequest<LastFM.SessionResponse>(
    {
      method: 'auth.getSession',
      token,
    },
    true,
    'POST',
  );
};

// Scrobbling API methods
export const updateNowPlaying = async (
  artist: string,
  track: string,
  sessionKey: string,
  album?: string,
  albumArtist?: string,
  duration?: number,
): Promise<LastFM.UpdateNowPlayingResponse | LastFM.ErrorResponse> => {
  const params: Record<string, string | number> = {
    method: 'track.updateNowPlaying',
    artist,
    track,
    sk: sessionKey,
  };
  if (album) params.album = album;
  if (albumArtist) params.albumArtist = albumArtist;
  if (duration) params.duration = duration;

  return lastfmApiRequest<LastFM.UpdateNowPlayingResponse>(
    params,
    true,
    'POST',
  );
};

export const scrobbleTrack = async (
  artist: string,
  track: string,
  timestamp: number, // Unix timestamp
  sessionKey: string,
  album?: string,
  albumArtist?: string,
  duration?: number,
): Promise<LastFM.ScrobbleResponse | LastFM.ErrorResponse> => {
  const params: Record<string, string | number> = {
    method: 'track.scrobble',
    artist,
    track,
    timestamp,
    sk: sessionKey,
  };
  if (album) params.album = album;
  if (albumArtist) params.albumArtist = albumArtist;
  if (duration) params.duration = duration;

  // Last.fm allows batch scrobbling. For simplicity, this function scrobbles one track.
  // To scrobble multiple, you'd use array notation: artist[0], track[0], timestamp[0], etc.
  return lastfmApiRequest<LastFM.ScrobbleResponse>(params, true, 'POST');
};

// User API methods
export const getUserRecentTracks = async (
  user: string,
  limit: number = 20,
  page: number = 1,
  extended: 0 | 1 = 0, // 0 for no extended data, 1 for extended data (album, artist images)
): Promise<LastFM.RecentTracksResponse | LastFM.ErrorResponse> => {
  return lastfmApiRequest<LastFM.RecentTracksResponse>({
    method: 'user.getRecentTracks',
    user,
    limit,
    page,
    extended,
  }); // This is a public method, no signing or session key needed usually
};

export const getUserTopTracks = async (
  user: string,
  period:
    | 'overall'
    | '7day'
    | '1month'
    | '3month'
    | '6month'
    | '12month' = 'overall',
  limit: number = 50, // More tracks for better potential pool
  page: number = 1,
): Promise<LastFM.UserTopTracksResponse | LastFM.ErrorResponse> => {
  return lastfmApiRequest<LastFM.UserTopTracksResponse>({
    method: 'user.getTopTracks',
    user,
    period,
    limit,
    page,
  });
};

// Example for fetching track info (can be used to get more details if needed)
// export const getTrackInfo = async (artist: string, track: string, username?: string): Promise<any> => {
//   const params: Record<string, string> = {
//     method: 'track.getInfo',
//     artist,
//     track,
//   };
//   if (username) params.username = username; // To get user-specific info like playcount
//   return lastfmApiRequest(params);
// };
