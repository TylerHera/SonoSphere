import { NextRequest, NextResponse } from 'next/server';
import { AggregatedSearchResults, UnifiedSearchResult, SearchResultSource } from '@/types/search';

// Placeholder for actual search functions from different API clients
// These would be imported from your actual API client files (e.g., @/lib/api/spotify, @/lib/api/appleMusic, etc.)

// Example: Spotify Search (actual implementation would call Spotify API)
async function searchSpotify(query: string): Promise<UnifiedSearchResult[]> {
  console.log(`Searching Spotify for: ${query}`);
  // const spotifyResults = await actualSpotifySearch(query);
  // return mapSpotifyResultsToUnifiedFormat(spotifyResults);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
  if (query.toLowerCase().includes("error")) throw new Error("Spotify search failed intentionally");
  if (query.toLowerCase().includes("empty")) return [];
  return [
    {
      id: 'spotify_track_123',
      source: 'spotify',
      title: `Spotify Track: ${query} Result 1`,
      artist: 'Spotify Artist',
      album: 'Spotify Album',
      imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Spotify',
      type: 'track',
      url: '#',
      spotifyUri: 'spotify:track:123'
    },
  ] as UnifiedSearchResult[];
}

// Example: Apple Music Search
async function searchAppleMusicAPI(query: string): Promise<UnifiedSearchResult[]> {
  console.log(`Searching Apple Music for: ${query}`);
  // const appleMusicResults = await actualAppleMusicSearch(query);
  // return mapAppleMusicResultsToUnifiedFormat(appleMusicResults);
  await new Promise(resolve => setTimeout(resolve, 250));
  return [
    {
      id: 'apple_track_456',
      source: 'appleMusic',
      title: `Apple Music Song: ${query} Example`,
      artist: 'Apple Artist',
      album: 'Apple Album',
      imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=AppleMusic',
      type: 'track',
      url: '#',
      appleMusicId: '456'
    },
  ] as UnifiedSearchResult[];
}

// Example: Discogs Search
async function searchDiscogsAPI(query: string): Promise<UnifiedSearchResult[]> {
  console.log(`Searching Discogs for: ${query}`);
  // const discogsResults = await actualDiscogsSearch(query);
  // return mapDiscogsResultsToUnifiedFormat(discogsResults);
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'discogs_release_789',
      source: 'discogs',
      title: `Discogs Release: ${query} Title`,
      artist: 'Discogs Artist',
      year: '2023',
      imageUrl: 'https://via.placeholder.com/150/00FF00/000000?Text=Discogs',
      type: 'album',
      url: '#',
      discogsReleaseId: 789
    },
  ] as UnifiedSearchResult[];
}

// Add more placeholder search functions for YouTube, MusicBrainz, etc.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const sourcesParam = searchParams.get('sources'); // e.g., sources=spotify,appleMusic

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  let selectedSources: SearchResultSource[] = ['spotify', 'appleMusic', 'discogs']; // Default sources
  if (sourcesParam) {
    selectedSources = sourcesParam.split(',') as SearchResultSource[];
    // Basic validation if needed: ensure sources are valid SearchResultSource types
  }

  const allResults: UnifiedSearchResult[] = [];
  const errors: Partial<Record<SearchResultSource, string>> = {};

  const searchPromises: Promise<UnifiedSearchResult[]>[] = [];
  const sourceMap: Record<number, SearchResultSource> = {}; // To map promise index back to source
  let promiseIndex = 0;

  if (selectedSources.includes('spotify')) {
    searchPromises.push(searchSpotify(query).catch(err => { errors.spotify = err.message; return []; }));
    sourceMap[promiseIndex++] = 'spotify';
  }
  if (selectedSources.includes('appleMusic')) {
    searchPromises.push(searchAppleMusicAPI(query).catch(err => { errors.appleMusic = err.message; return []; }));
    sourceMap[promiseIndex++] = 'appleMusic';
  }
  if (selectedSources.includes('discogs')) {
    searchPromises.push(searchDiscogsAPI(query).catch(err => { errors.discogs = err.message; return []; }));
    sourceMap[promiseIndex++] = 'discogs';
  }
  // Add other sources similarly

  try {
    const promiseResults = await Promise.allSettled(searchPromises);
    
    promiseResults.forEach((settledResult, index) => {
      if (settledResult.status === 'fulfilled' && Array.isArray(settledResult.value)) {
        allResults.push(...settledResult.value);
      } else if (settledResult.status === 'rejected') {
        const source = sourceMap[index];
        if (source && !errors[source]) { // Only record error if not already caught by individual catch
            errors[source] = settledResult.reason?.message || 'Search failed for this source.';
        }
        console.error(`Search failed for source index ${index} (${source || 'unknown'}):`, settledResult.reason);
      }
    });

    // Basic relevance sort: exact title matches first, then artist, then album.
    // This is very naive, a proper search would use relevance scores from APIs or a search engine.
    allResults.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        // Add more sorting criteria if needed
        return 0;
    });

    const responseData: AggregatedSearchResults & { errors?: Partial<Record<SearchResultSource, string>> } = {
      query,
      results: allResults,
    };
    if (Object.keys(errors).length > 0) {
        responseData.errors = errors;
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Unified search error:", error);
    return NextResponse.json({ message: 'An error occurred during the search', error: error.message }, { status: 500 });
  }
} 