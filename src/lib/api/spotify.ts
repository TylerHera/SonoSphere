import { SpotifyRecommendationsParams, SpotifyRecommendationsResponse, SpotifyUserProfile, SpotifySearchResults } from '@/types/spotify';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

interface SpotifyApiError {
  error: {
    status: number;
    message: string;
  };
}

async function fetchSpotifyApi<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string | number | undefined>,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/${endpoint}`);
  if (params && method === 'GET') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (method !== 'GET' && body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData: SpotifyApiError = await response.json();
    console.error(`Spotify API Error (${response.status}): ${errorData.error.message}`, errorData);
    throw new Error(`Spotify API Error: ${errorData.error.message}`);
  }
  // For 204 No Content responses (e.g. after PUT to player endpoint with no response body)
  if (response.status === 204) {
    return {} as T; // Or handle as appropriate for your use case
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches recommendations from Spotify based on seeds and tuneable track attributes.
 * Requires a valid access token with appropriate scopes (though recommendations don't explicitly list scopes, playback related scopes might be relevant if playing results).
 */
export async function getSpotifyRecommendations(
  accessToken: string,
  params: SpotifyRecommendationsParams
): Promise<SpotifyRecommendationsResponse> {
  if (!params.seed_artists && !params.seed_genres && !params.seed_tracks) {
    throw new Error('At least one seed (artist, genre, or track) must be provided for recommendations.');
  }
  // Ensure seeds are comma-separated strings if they are arrays
  const queryParams: Record<string, string | number | undefined> = { ...params };

  if (Array.isArray(params.seed_artists)) {
    queryParams.seed_artists = params.seed_artists.join(',');
  }
  if (Array.isArray(params.seed_genres)) {
    queryParams.seed_genres = params.seed_genres.join(',');
  }
  if (Array.isArray(params.seed_tracks)) {
    queryParams.seed_tracks = params.seed_tracks.join(',');
  }

  return fetchSpotifyApi<SpotifyRecommendationsResponse>('recommendations', accessToken, queryParams);
}

/**
 * Fetches the current user's profile.
 * Requires a valid access token with the `user-read-private` and `user-read-email` scopes.
 */
export async function getSpotifyUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
  return fetchSpotifyApi<SpotifyUserProfile>('me', accessToken);
}

/**
 * Searches Spotify for tracks, artists, or albums.
 * Scope: `user-read-private` (recommended for market parameter)
 */
export async function searchSpotify(
  accessToken: string,
  query: string,
  types: ('album' | 'artist' | 'track')[],
  limit: number = 20,
  offset: number = 0,
  market?: string
): Promise<SpotifySearchResults> {
  const params: Record<string, string | number | undefined> = {
    q: query,
    type: types.join(','),
    limit,
    offset,
    market,
  };
  return fetchSpotifyApi<SpotifySearchResults>('search', accessToken, params);
}

// Example of how play control might be refactored here later, though it's currently in SpotifyPlayerProvider
/*
export async function playSpotifyTracks(
  accessToken: string,
  deviceId: string,
  uris?: string[],
  contextUri?: string
): Promise<void> {
  const body: any = {};
  if (uris && uris.length > 0) body.uris = uris;
  if (contextUri) body.context_uri = contextUri;

  await fetchSpotifyApi<void>(
    `me/player/play?device_id=${deviceId}`,
    accessToken,
    undefined, // No query params for this PUT
    'PUT',
    body
  );
}
*/

// Add more Spotify API functions as needed (e.g., get user's top items, playlists, etc.) 