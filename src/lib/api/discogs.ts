const DISCOGS_API_BASE_URL = 'https://api.discogs.com';
const userAgent = process.env.DISCOGS_USER_AGENT || 'SonoSphere/0.1'; // Fallback, but should be set in .env
const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

interface DiscogsError {
  message: string;
}

// Basic type for a Release (can be expanded significantly)
export interface DiscogsRelease {
  id: number;
  title: string;
  artists_sort?: string; // Usually available
  artists?: { name: string; join?: string }[];
  year?: number;
  thumb?: string; // Thumbnail image URL
  cover_image?: string; // Full cover image URL
  genres?: string[];
  styles?: string[];
  tracklist?: { position: string; title: string; duration: string }[];
  notes?: string;
  labels?: { name: string; catno?: string }[];
  // Add more fields as needed based on Discogs API response
}

// Type for search results
export interface DiscogsSearchResult {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: { next?: string; last?: string };
  };
  results: DiscogsRelease[]; // Search results are usually release-like objects
}

async function fetchDiscogsAPI<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${DISCOGS_API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }

  const headers: HeadersInit = {
    'User-Agent': userAgent,
  };

  // For public endpoints, key/secret might not be strictly needed but can be added for higher rate limits or specific auth
  // For now, we'll use it if available, but Discogs public endpoints work with User-Agent alone.
  // The main use of key/secret is for OAuth 1.0a.
  // if (consumerKey && consumerSecret) {
  //   headers['Authorization'] = `Discogs key=${consumerKey}, secret=${consumerSecret}`;
  // }

  try {
    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const errorData: DiscogsError = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Discogs API Error (${response.status}) for ${endpoint}:`, errorData.message);
      throw new Error(`Discogs API Error: ${errorData.message || response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Failed to fetch from Discogs API (${endpoint}):`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Fetches details for a specific release from Discogs.
 * @param releaseId The ID of the Discogs release.
 */
export async function getRelease(releaseId: number): Promise<DiscogsRelease> {
  if (!releaseId) throw new Error('Release ID is required');
  return fetchDiscogsAPI<DiscogsRelease>(`/releases/${releaseId}`);
}

/**
 * Searches for releases on Discogs.
 * @param searchParams Parameters for searching (e.g., query, artist, release_title).
 */
export async function searchReleases(searchParams: {
  query?: string; // General query
  release_title?: string;
  artist?: string;
  year?: string;
  genre?: string;
  style?: string;
  country?: string;
  format?: string; // e.g., 'Vinyl'
  catno?: string; // Catalog number
  barcode?: string;
  page?: number;
  per_page?: number;
}): Promise<DiscogsSearchResult> {
  return fetchDiscogsAPI<DiscogsSearchResult>('/database/search', { ...searchParams, type: 'release' });
}

/**
 * Placeholder for fetching a user's Discogs collection (e.g., "Have" list).
 * NOTE: This requires OAuth 1.0a authentication with the Discogs API,
 * which is more complex than typical OAuth2 and involves obtaining user-specific tokens.
 * @param discogsUsername The Discogs username.
 * @param folderId The ID of the folder to fetch (0 for Uncategorized, 1 for All).
 * @param sort Sort order (e.g., 'added', 'artist', 'title').
 * @param sortOrder Sort direction ('asc' or 'desc').
 * @param userAuthToken User's OAuth access token data (complex object for OAuth 1.0a).
 */
export async function getUserDiscogsCollection(
  // discogsUsername: string, 
  // folderId: number = 0, 
  // sort: string = 'added', 
  // sortOrder: string = 'desc',
  // userAuthToken: any // This will be specific to how OAuth 1.0a token is stored
): Promise<any> { // Replace 'any' with a proper CollectionResult type
  console.warn(
    'getUserDiscogsCollection: Not implemented. Requires Discogs OAuth 1.0a user authentication.'
  );
  // Example endpoint: /users/{username}/collection/folders/{folder_id}/releases
  // This would use a fetch function that includes OAuth 1.0a headers.
  return Promise.resolve({ pagination: {}, releases: [] }); // Return mock/empty data for now
} 