import { MUSICBRAINZ_USER_AGENT } from "@/lib/constants/apiKeys";
import type { MusicBrainz } from "@/types/musicbrainz"; // Import the new namespace

const MUSICBRAINZ_API_BASE_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_ARCHIVE_API_BASE_URL = "https://coverartarchive.org";

// Helper function to build Lucene query string safely
const buildLuceneQuery = (params: Record<string, string | number | undefined>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => `${key}:${String(value).includes(" ") ? `"${value}"` : value}`)
    .join(" AND ");
};

async function fetchMusicBrainzAPI<T extends MusicBrainz.SearchResponseHeader | MusicBrainz.Release | MusicBrainz.Recording | MusicBrainz.Artist | MusicBrainz.ReleaseGroup>(
  endpoint: string, 
  params: Record<string, any> = {},
  isSearch: boolean = false
): Promise<T> {
  const urlParams = new URLSearchParams({
    fmt: "json",
    ...params,
  });
  const url = `${MUSICBRAINZ_API_BASE_URL}/${endpoint}?${urlParams.toString()}`;

  // console.log(`Fetching from MusicBrainz: ${url}`); // For debugging

  const response = await fetch(url, {
    headers: {
      "User-Agent": MUSICBRAINZ_USER_AGENT || "SonoSphere/0.1 ( mailto:YOUR_EMAIL_HERE )",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`MusicBrainz API Error (${response.status}) for ${url}: ${errorBody}`);
    throw new Error(`MusicBrainz API request failed: ${response.statusText} - ${errorBody}`);
  }
  const data = await response.json();
  // For search results, the actual items are usually in a nested array, e.g., data.artists, data.releases
  // For direct entity lookups (e.g., /release/mbid), the data is the entity itself.
  return data as T;
}

async function fetchCoverArt(mbid: string, entityType: "release" | "release-group"): Promise<MusicBrainz.CoverArtResponse | undefined> {
  try {
    const url = `${COVER_ART_ARCHIVE_API_BASE_URL}/${entityType}/${mbid}`;
    // console.log(`Fetching cover art from: ${url}`);
    const response = await fetch(url, { redirect: 'manual' }); // Use manual to check for actual image redirects or JSON

    if (response.status === 307 || response.status === 302) { // Temporary or Found redirect (often to image itself)
        const location = response.headers.get('location');
        if (location && (location.endsWith('.jpg') || location.endsWith('.png') || location.endsWith('.jpeg'))) {
            // It's a direct image, construct a simple CoverArtResponse-like object
            return {
                images: [{
                    id: 'redirected',
                    image: location,
                    thumbnails: { small: location, large: location }, // Use full image for thumbs
                    front: true, // Assumption
                    back: false,
                    edit: 0, approved: true, comment: "", types: ["Front"]
                }],
                release: url // original request url
            };
        }
        // If redirect is not to an image, try to follow it once if desired, or treat as no art
    }


    if (!response.ok) {
      if (response.status === 404) {
        // console.log(`No cover art found for ${entityType} ${mbid}`);
        return undefined;
      }
      // const errorBody = await response.text();
      // console.error(`Cover Art Archive Error (${response.status}) for ${url}: ${errorBody}`);
      return undefined;
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data as MusicBrainz.CoverArtResponse;
    } else {
        // If it's an image directly (e.g. some CAA direct image links after one redirect)
        // This case might be less common for release-group endpoint without specific file.
        // console.log(`Cover art for ${entityType} ${mbid} is a direct image: ${response.url}`);
        return {
             images: [{
                id: 'direct_image',
                image: response.url,
                thumbnails: { small: response.url, large: response.url },
                front: true, back: false, edit: 0, approved: true, comment: "", types: ["Front"]
            }],
            release: `${COVER_ART_ARCHIVE_API_BASE_URL}/${entityType}/${mbid}` // original request url
        };
    }

  } catch (error: any) {
    console.error(`Failed to fetch/process cover art for ${entityType} ${mbid}: ${error.message}`);
    return undefined;
  }
}

const getSmallestThumbnail = (coverArt?: MusicBrainz.CoverArtResponse): string | undefined => {
    if (!coverArt || !coverArt.images || coverArt.images.length === 0) return undefined;
    const frontImage = coverArt.images.find(img => img.front && (img.types.includes("Front") || img.types.includes("front")));
    const imageToUse = frontImage || coverArt.images[0];
    
    if (imageToUse.thumbnails) {
        if (imageToUse.thumbnails.small) return imageToUse.thumbnails.small.replace(/^http:/, 'https');
        if (imageToUse.thumbnails["250"]) return imageToUse.thumbnails["250"].replace(/^http:/, 'https');
        if (imageToUse.thumbnails.large) return imageToUse.thumbnails.large.replace(/^http:/, 'https');
        if (imageToUse.thumbnails["500"]) return imageToUse.thumbnails["500"].replace(/^http:/, 'https');
    }
    return imageToUse.image.replace(/^http:/, 'https');
};


export async function searchReleaseGroups(
    queryParams: { artist?: string; releasegroup?: string; query?: string; type?: MusicBrainz.ReleaseGroup["primary-type"]; primarytype?: MusicBrainz.ReleaseGroup["primary-type"]; limit?: number; offset?: number; }
): Promise<MusicBrainz.ReleaseGroupSearchResponse> {
  let query = queryParams.query || "";
  const conditions: Record<string, string> = {};
  if (queryParams.artist) conditions.artist = queryParams.artist;
  if (queryParams.releasegroup) conditions.releasegroup = queryParams.releasegroup;
  if (queryParams.type) conditions.type = queryParams.type; // e.g. album, single
  if (queryParams.primarytype) conditions.primarytype = queryParams.primarytype;


  const luceneQuery = buildLuceneQuery(conditions) + (query ? (buildLuceneQuery(conditions) ? " AND " : "") + query : "");
  
  return fetchMusicBrainzAPI<MusicBrainz.ReleaseGroupSearchResponse>("release-group", {
    query: luceneQuery,
    limit: queryParams.limit || 25,
    offset: queryParams.offset || 0,
  }, true);
}


// Transformed to use new types and structure
export async function searchUpcomingReleases(query?: string, daysAhead = 90): Promise<MusicBrainz.ReleaseGroup[]> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const luceneQuery = 
    `date:[${formatDate(today)} TO ${formatDate(futureDate)}] AND (type:album OR type:ep)` +
    (query ? ` AND (${query})` : '');
  
  try {
    const data = await searchReleaseGroups({ query: luceneQuery, limit: 25 });
    if (data && data["release-groups"]) {
      return data["release-groups"].sort((a, b) => {
        if (!a["first-release-date"]) return 1;
        if (!b["first-release-date"]) return -1;
        return new Date(a["first-release-date"]).getTime() - new Date(b["first-release-date"]).getTime();
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching upcoming releases from MusicBrainz:", error);
    return [];
  }
}

export async function getArtistReleaseGroups(artistMbid: MusicBrainz.MBID, type?: MusicBrainz.ReleaseGroup["primary-type"]): Promise<MusicBrainz.ReleaseGroup[]> {
  try {
    const data = await searchReleaseGroups({ artist: artistMbid, type: type || "album", limit: 50 });
     if (data && data["release-groups"]) {
      return data["release-groups"].sort((a, b) => {
        if (!a["first-release-date"]) return 1;
        if (!b["first-release-date"]) return -1;
        return new Date(b["first-release-date"]).getTime() - new Date(a["first-release-date"]).getTime(); // Sort descending by date
      });
    }
    return [];
  } catch (error) {
    console.error(`Error fetching release groups for artist ${artistMbid}:`, error);
    return [];
  }
}

// New search functions
export async function searchArtists(query: string, limit: number = 10, offset: number = 0): Promise<MusicBrainz.ArtistSearchResponse> {
  return fetchMusicBrainzAPI<MusicBrainz.ArtistSearchResponse>("artist", { query, limit, offset }, true);
}

export async function searchReleases(query: string, limit: number = 10, offset: number = 0): Promise<MusicBrainz.ReleaseSearchResponse> {
  // Example query: "release:Nevermind AND artist:Nirvana AND status:official AND type:album"
  // Or free text: "Nevermind Nirvana"
  return fetchMusicBrainzAPI<MusicBrainz.ReleaseSearchResponse>("release", { query, limit, offset }, true);
}

export async function searchRecordings(query: string, limit: number = 10, offset: number = 0): Promise<MusicBrainz.RecordingSearchResponse> {
  // Example query: "recording:Smells Like Teen Spirit AND artist:Nirvana"
  return fetchMusicBrainzAPI<MusicBrainz.RecordingSearchResponse>("recording", { query, limit, offset }, true);
}

// New detail-fetching functions
/**
 * Fetches detailed information for a specific release.
 * @param releaseMbid The MBID of the release.
 * @param inc A string of include parameters (e.g., "artist-credits+labels+recordings+release-groups").
 */
export async function getReleaseDetails(releaseMbid: MusicBrainz.MBID, inc: string = "artist-credits+labels+recordings+release-groups"): Promise<MusicBrainz.Release> {
  return fetchMusicBrainzAPI<MusicBrainz.Release>(`release/${releaseMbid}`, { inc });
}

/**
 * Fetches detailed information for a specific recording.
 * @param recordingMbid The MBID of the recording.
 * @param inc A string of include parameters (e.g., "artist-credits+releases+release-groups").
 */
export async function getRecordingDetails(recordingMbid: MusicBrainz.MBID, inc: string = "artist-credits+releases+release-groups"): Promise<MusicBrainz.Recording> {
  return fetchMusicBrainzAPI<MusicBrainz.Recording>(`recording/${recordingMbid}`, { inc });
}

/**
 * Fetches detailed information for a specific artist.
 * @param artistMbid The MBID of the artist.
 * @param inc A string of include parameters (e.g., "releases+release-groups+aliases").
 */
export async function getArtistDetails(artistMbid: MusicBrainz.MBID, inc: string = "release-groups+aliases"): Promise<MusicBrainz.Artist> {
    return fetchMusicBrainzAPI<MusicBrainz.Artist>(`artist/${artistMbid}`, { inc });
}

/**
 * Fetches detailed information for a specific release group.
 * @param releaseGroupMbid The MBID of the release group.
 * @param inc A string of include parameters (e.g., "artists+releases").
 */
export async function getReleaseGroupDetails(releaseGroupMbid: MusicBrainz.MBID, inc: string = "artists+releases"): Promise<MusicBrainz.ReleaseGroup> {
    return fetchMusicBrainzAPI<MusicBrainz.ReleaseGroup>(`release-group/${releaseGroupMbid}`, { inc });
}


export { getSmallestThumbnail as getCoverArtThumbnail }; // Export helper

// MBRelease type is now part of MusicBrainz.ReleaseGroup or MusicBrainz.Release
// The old MBRelease was a simplified version mainly for the calendar.
// The new types in musicbrainz.d.ts are more comprehensive.
// Existing functions searchUpcomingReleases & getArtistReleases now return arrays of MusicBrainz.ReleaseGroup

// Example of how to get cover art for a release group for the calendar:
/*
async function getReleaseGroupsWithCovers(artistMbid: string): Promise<(MusicBrainz.ReleaseGroup & { coverArtUrl?: string })[]> {
  const releaseGroups = await getArtistReleaseGroups(artistMbid);
  return Promise.all(
    releaseGroups.map(async (rg) => {
      const coverArtData = await fetchCoverArt(rg.id, "release-group");
      return {
        ...rg,
        coverArtUrl: getSmallestThumbnail(coverArtData),
      };
    })
  );
}
*/ 