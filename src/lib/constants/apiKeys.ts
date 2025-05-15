// Base API URLs (can be moved to a general config if needed)
export const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Discogs API Credentials (Client-side usage should be careful, consider proxying)
export const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY;
export const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET;
export const DISCOGS_USER_AGENT =
  process.env.DISCOGS_USER_AGENT || 'SonoSphere/0.1 (https://your.app.url)';

// Spotify API Credentials (Client-side, ensure redirect URIs are whitelisted)
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Note: Exposing this client-side is risky for some OAuth flows.
// For Authorization Code Flow, it should be backend only.
// For Client Credentials Flow, it can be backend only.
// For Implicit Grant Flow (less common now), client ID is used.
export const NEXT_PUBLIC_SPOTIFY_REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

// Last.fm API Credentials
export const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
export const LASTFM_SHARED_SECRET = process.env.LASTFM_SHARED_SECRET; // Primarily for backend use (e.g. session signing)
export const NEXT_PUBLIC_LASTFM_CALLBACK_URL =
  process.env.NEXT_PUBLIC_LASTFM_CALLBACK_URL;

// MusicBrainz API Configuration
export const MUSICBRAINZ_USER_AGENT =
  process.env.NEXT_PUBLIC_MUSICBRAINZ_USER_AGENT ||
  'SonoSphere/0.1 ( mailto:your-email@example.com ) Tell MusicBrainz who you are!';

// Supabase (Public Keys - Safe for client-side)
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Apple MusicKit JS Configuration
// IMPORTANT: The Developer Token is sensitive and should ideally be generated on-demand by a backend
// and passed to the client. Storing a long-lived developer token directly in client-side accessible
// env variables is less secure. For this project, we'll use an env var, but be mindful of this for production.
export const NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN =
  process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN;
export const APPLE_MUSIC_API_BASE_URL = 'https://api.music.apple.com';

/**
 * IMPORTANT SECURITY NOTES:
 * 1. Never expose private API keys or secrets directly in client-side code if they are meant for backend use.
 *    Use environment variables prefixed with NEXT_PUBLIC_ for keys that MUST be accessed by the browser.
 * 2. For APIs requiring secret keys (like Discogs Consumer Secret for OAuth, Spotify Client Secret for certain flows, Last.fm Shared Secret),
 *    perform operations requiring these secrets on your backend and expose an endpoint for your frontend to call.
 * 3. The DISCOGS_USER_AGENT and MUSICBRAINZ_USER_AGENT are important for API ToS compliance.
 *    For MusicBrainz, they require a meaningful User-Agent, preferably with contact info.
 */
