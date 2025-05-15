'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getSpotifyRecommendations, searchSpotify } from '@/lib/api/spotify';
import { 
  SpotifyTrack, 
  SpotifyRecommendationsParams, 
  SpotifyArtist, 
  SpotifySearchResults,
  DiscoveryQueue,
  DiscoveryItem,
  SavedPlaylist
} from '@/types/spotify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { XIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

const MAX_SEEDS = 5;

export default function RecommendationsPage() {
  const { session } = useAuth();
  const [currentDiscoveryQueue, setCurrentDiscoveryQueue] = useState<DiscoveryQueue | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  
  const [limit, setLimit] = useState<number>(20);
  const [seedGenresInput, setSeedGenresInput] = useState<string>('');

  const [targetDanceability, setTargetDanceability] = useState<number | undefined>(undefined);
  const [targetEnergy, setTargetEnergy] = useState<number | undefined>(undefined);
  const [targetValence, setTargetValence] = useState<number | undefined>(undefined);
  const [minPopularity, setMinPopularity] = useState<number | undefined>(undefined);

  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSearchResults, setArtistSearchResults] = useState<SpotifyArtist[]>([]);
  const [selectedArtistSeeds, setSelectedArtistSeeds] = useState<SpotifyArtist[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);

  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackSearchResults, setTrackSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrackSeeds, setSelectedTrackSeeds] = useState<SpotifyTrack[]>([]);
  const [isSearchingTracks, setIsSearchingTracks] = useState(false);

  const totalSeeds = selectedArtistSeeds.length + selectedTrackSeeds.length + (seedGenresInput.split(',').filter(g => g.trim() !== '').length);

  const debouncedArtistSearch = useCallback(
    debounce(async (query: string, token: string) => {
      if (query.length < 2) {
        setArtistSearchResults([]);
        return;
      }
      setIsSearchingArtists(true);
      try {
        const results: SpotifySearchResults = await searchSpotify(token, query, ['artist'], 5);
        setArtistSearchResults(results.artists?.items || []);
      } catch (error) {  
        console.error("Artist search error:", error);
        toast.error("Failed to search artists.");
        setArtistSearchResults([]);
      } finally {
        setIsSearchingArtists(false);
      }
    }, 500),
    [session?.provider_token]
  );

  const debouncedTrackSearch = useCallback(
    debounce(async (query: string, token: string) => {
      if (query.length < 2) {
        setTrackSearchResults([]);
        return;
      }
      setIsSearchingTracks(true);
      try {
        const results: SpotifySearchResults = await searchSpotify(token, query, ['track'], 5);
        setTrackSearchResults(results.tracks?.items || []);
      } catch (error) {
        console.error("Track search error:", error);
        toast.error("Failed to search tracks.");
        setTrackSearchResults([]);
      } finally {
        setIsSearchingTracks(false);
      }
    }, 500),
    [session?.provider_token]
  );

  useEffect(() => {
    if (artistSearchQuery && session?.provider_token) {
      debouncedArtistSearch(artistSearchQuery, session.provider_token);
    }
  }, [artistSearchQuery, session?.provider_token, debouncedArtistSearch]);

  useEffect(() => {
    if (trackSearchQuery && session?.provider_token) {
      debouncedTrackSearch(trackSearchQuery, session.provider_token);
    }
  }, [trackSearchQuery, session?.provider_token, debouncedTrackSearch]);

  const addSeed = (item: SpotifyArtist | SpotifyTrack, type: 'artist' | 'track') => {
    if (totalSeeds >= MAX_SEEDS) {
      toast.error(`Maximum of ${MAX_SEEDS} seeds allowed.`);
      return;
    }
    if (type === 'artist') {
      if (!selectedArtistSeeds.find(s => s.id === item.id)) {
        setSelectedArtistSeeds(prev => [...prev, item as SpotifyArtist]);
      }
      setArtistSearchQuery('');
      setArtistSearchResults([]);
    } else if (type === 'track') {
      if (!selectedTrackSeeds.find(s => s.id === item.id)) {
        setSelectedTrackSeeds(prev => [...prev, item as SpotifyTrack]);
      }
      setTrackSearchQuery('');
      setTrackSearchResults([]);
    }
  };

  const removeSeed = (id: string, type: 'artist' | 'track' | 'genre') => {
    if (type === 'artist') {
      setSelectedArtistSeeds(prev => prev.filter(s => s.id !== id));
    } else if (type === 'track') {
      setSelectedTrackSeeds(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.provider_token) {
      toast.error('Spotify not connected or session expired.');
      return;
    }
    if (totalSeeds === 0) {
      toast.error('Please add at least one seed (artist, genre, or track).');
      return;
    }
    if (totalSeeds > MAX_SEEDS) {
      toast.error(`Too many seeds. Maximum of ${MAX_SEEDS} allowed, found ${totalSeeds}. Please remove some.`);
      return;
    }

    setIsLoadingRecommendations(true);
    setCurrentDiscoveryQueue(null);

    try {
      const params: SpotifyRecommendationsParams = {
        limit: limit,
        seed_artists: selectedArtistSeeds.map(s => s.id).join(',') || undefined,
        seed_genres: seedGenresInput.trim() || undefined,
        seed_tracks: selectedTrackSeeds.map(s => s.id).join(',') || undefined,
      };

      if (targetDanceability !== undefined) params.target_danceability = targetDanceability;
      if (targetEnergy !== undefined) params.target_energy = targetEnergy;
      if (targetValence !== undefined) params.target_valence = targetValence;
      if (minPopularity !== undefined) params.min_popularity = minPopularity;
      
      const response = await getSpotifyRecommendations(session.provider_token, params);
      
      const discoveryItems: DiscoveryItem[] = response.tracks.map(track => ({
        ...track,
        sourceAlgorithm: 'spotify-recommendations',
      }));

      const newQueue: DiscoveryQueue = {
        id: new Date().toISOString(),
        name: `Recommendations based on ${totalSeeds} seed(s)`,
        items: discoveryItems,
        generatedAt: new Date().toISOString(),
        sourceSeeds: {
            artists: selectedArtistSeeds.length > 0 ? [...selectedArtistSeeds] : undefined,
            tracks: selectedTrackSeeds.length > 0 ? [...selectedTrackSeeds] : undefined,
            genres: seedGenresInput.split(',').filter(g => g.trim() !== '').length > 0 ? seedGenresInput.split(',').filter(g => g.trim() !== '') : undefined,
        }
      };
      setCurrentDiscoveryQueue(newQueue);

      if (response.tracks.length === 0) {
        toast.info('No recommendations found for the given criteria.');
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error(error.message || 'Failed to fetch recommendations.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handlePlayTrack = (trackUri: string) => {
    console.log('Attempting to play track:', trackUri);
    toast.info("Playback functionality for recommended tracks is a TODO.");
  };
  
  const handleSavePlaylist = () => {
    if (!currentDiscoveryQueue) {
      toast.error("No recommendations to save.");
      return;
    }
    const newSavedPlaylist: SavedPlaylist = {
      ...currentDiscoveryQueue,
      savedAt: new Date().toISOString(),
    };
    setSavedPlaylists(prev => [...prev, newSavedPlaylist]);
    toast.success(`Playlist "${currentDiscoveryQueue.name}" saved locally.`);
    console.log("Saving playlist locally:", newSavedPlaylist);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Spotify Recommendations</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find New Music</CardTitle>
          <CardDescription>
            Add up to {MAX_SEEDS} seeds (artists, tracks, or genres) and optionally tune parameters to get recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="artistSearch">Seed Artists ({selectedArtistSeeds.length}/{MAX_SEEDS - (selectedTrackSeeds.length + (seedGenresInput.split(',').filter(g => g.trim() !== '').length || 0)) } remaining)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input 
                      id="artistSearch" 
                      value={artistSearchQuery}
                      onChange={(e) => setArtistSearchQuery(e.target.value)}
                      placeholder="Search for an artist..."
                      disabled={totalSeeds >= MAX_SEEDS && !selectedArtistSeeds.find(a => a.name.toLowerCase().includes(artistSearchQuery.toLowerCase()))}
                    />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </PopoverTrigger>
                {(artistSearchResults.length > 0 || isSearchingArtists) && (
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandList>
                        {isSearchingArtists && <CommandItem disabled>Searching...</CommandItem>}
                        {!isSearchingArtists && artistSearchResults.length === 0 && artistSearchQuery && <CommandItem disabled>No artists found.</CommandItem>}
                        <CommandGroup heading="Artists">
                          {artistSearchResults.map(artist => (
                            <CommandItem 
                              key={artist.id} 
                              onSelect={() => addSeed(artist, 'artist')}                              
                              value={artist.name}
                            >
                              {artist.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedArtistSeeds.map(artist => (
                  <Badge key={artist.id} variant="secondary">
                    {artist.name}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => removeSeed(artist.id, 'artist')}>
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackSearch">Seed Tracks ({selectedTrackSeeds.length}/{MAX_SEEDS - (selectedArtistSeeds.length + (seedGenresInput.split(',').filter(g => g.trim() !== '').length || 0)) } remaining)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                     <Input 
                      id="trackSearch" 
                      value={trackSearchQuery}
                      onChange={(e) => setTrackSearchQuery(e.target.value)}
                      placeholder="Search for a track..."
                      disabled={totalSeeds >= MAX_SEEDS && !selectedTrackSeeds.find(t => t.name.toLowerCase().includes(trackSearchQuery.toLowerCase()))}
                    />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </PopoverTrigger>
                {(trackSearchResults.length > 0 || isSearchingTracks) && (
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandList>
                        {isSearchingTracks && <CommandItem disabled>Searching...</CommandItem>}
                        {!isSearchingTracks && trackSearchResults.length === 0 && trackSearchQuery && <CommandItem disabled>No tracks found.</CommandItem>}
                        <CommandGroup heading="Tracks">
                          {trackSearchResults.map(track => (
                            <CommandItem 
                              key={track.id} 
                              onSelect={() => addSeed(track, 'track')}
                              value={track.name}
                            >
                              {track.name} <span className="text-xs text-muted-foreground ml-2">by {track.artists.map(a => a.name).join(', ')}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrackSeeds.map(track => (
                  <Badge key={track.id} variant="secondary">
                    {track.name}
                     <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => removeSeed(track.id, 'track')}>
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="seed_genres_input">Seed Genres (comma-separated)</Label>
              <Input 
                id="seed_genres_input" 
                name="seed_genres_input" 
                value={seedGenresInput}
                onChange={(e) => setSeedGenresInput(e.target.value)}
                placeholder="e.g., electronic,dance,hip-hop"
                disabled={totalSeeds >= MAX_SEEDS && seedGenresInput.split(',').filter(g => g.trim() !== '').length === 0}
              />
               <p className="text-xs text-muted-foreground mt-1">Current genre seeds: {seedGenresInput.split(',').filter(g => g.trim() !== '').length || 0}</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Fine-tune (Optional)</CardTitle>
                 <CardDescription className="text-xs">Adjust these audio features. Leave blank to ignore.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="target_danceability">Target Danceability</Label>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {targetDanceability !== undefined ? targetDanceability.toFixed(1) : 'Any'}
                    </span>
                  </div>
                  <Slider
                    id="target_danceability"
                    defaultValue={targetDanceability !== undefined ? [targetDanceability] : [0.5]}
                    value={targetDanceability !== undefined ? [targetDanceability] : undefined}
                    onValueChange={(value) => setTargetDanceability(value[0])}
                    max={1}
                    step={0.1}
                  />
                  {targetDanceability !== undefined && 
                    <Button variant="ghost" size="sm" onClick={() => setTargetDanceability(undefined)} className="text-xs">Clear</Button>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="target_energy">Target Energy</Label>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {targetEnergy !== undefined ? targetEnergy.toFixed(1) : 'Any'}
                    </span>
                  </div>
                  <Slider
                    id="target_energy"
                    defaultValue={targetEnergy !== undefined ? [targetEnergy] : [0.5]}
                    value={targetEnergy !== undefined ? [targetEnergy] : undefined}
                    onValueChange={(value) => setTargetEnergy(value[0])}
                    max={1}
                    step={0.1}
                  />
                   {targetEnergy !== undefined && 
                    <Button variant="ghost" size="sm" onClick={() => setTargetEnergy(undefined)} className="text-xs">Clear</Button>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="target_valence">Target Valence (Positiveness)</Label>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {targetValence !== undefined ? targetValence.toFixed(1) : 'Any'}
                    </span>
                  </div>
                  <Slider
                    id="target_valence"
                    defaultValue={targetValence !== undefined ? [targetValence] : [0.5]}
                    value={targetValence !== undefined ? [targetValence] : undefined}
                    onValueChange={(value) => setTargetValence(value[0])}
                    max={1}
                    step={0.1}
                  />
                  {targetValence !== undefined && 
                    <Button variant="ghost" size="sm" onClick={() => setTargetValence(undefined)} className="text-xs">Clear</Button>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_popularity">Minimum Popularity (0-100)</Label>
                  <Input 
                    id="min_popularity"
                    type="number"
                    value={minPopularity === undefined ? '' : minPopularity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMinPopularity(val === '' ? undefined : parseInt(val, 10));
                    }}
                    placeholder="Any (0-100)"
                    min="0"
                    max="100"
                  />
                   {minPopularity !== undefined && 
                    <Button variant="ghost" size="sm" onClick={() => setMinPopularity(undefined)} className="text-xs">Clear</Button>}
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Label htmlFor="limit">Number of Recommendations (1-100)</Label>
              <Input 
                id="limit" 
                name="limit" 
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                min="1" 
                max="100"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoadingRecommendations || totalSeeds === 0 || totalSeeds > MAX_SEEDS } className="mt-4">
                {isLoadingRecommendations ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                Get Recommendations
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoadingRecommendations && (
        <div className="text-center py-10">
          <LoadingSpinner className="h-8 w-8 text-primary" />
          <p className="mt-2 text-muted-foreground">Fetching your recommendations...</p>
        </div>
      )}

      {currentDiscoveryQueue && currentDiscoveryQueue.items.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{currentDiscoveryQueue.name}</CardTitle>
                <CardDescription>
                    Generated at {new Date(currentDiscoveryQueue.generatedAt).toLocaleTimeString()} with {currentDiscoveryQueue.items.length} tracks.
                </CardDescription>
            </div>
            <Button onClick={handleSavePlaylist} variant="outline">Save as Playlist</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentDiscoveryQueue.items.map((item, index) => (
                <Card key={item.id + '-' + index} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    {item.album.images?.[0]?.url && (
                      <img src={item.album.images[0].url} alt={item.album.name} className="h-16 w-16 rounded" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.artists.map(a => a.name).join(', ')} - {item.album.name}
                      </p>
                      {item.recommendedBecause && (
                        <p className="text-xs text-sky-600 dark:text-sky-400">Reason: {item.recommendedBecause}</p>
                      )}
                      {item.sourceAlgorithm && (
                        <Badge variant="outline" className="mt-1 text-xs">Source: {item.sourceAlgorithm}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePlayTrack(item.uri)}>
                      Play
                    </Button>
                     <Button variant="outline" size="sm" onClick={() => toast.info('Add to playback queue: TODO')}>
                      Add to Queue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentDiscoveryQueue && currentDiscoveryQueue.items.length === 0 && !isLoadingRecommendations && (
         <Card className="mt-8">
            <CardHeader>
                <CardTitle>No Results</CardTitle>
            </CardHeader>
            <CardContent>
                <p>No recommendations found for the selected criteria. Try adjusting your seeds or parameters.</p>
            </CardContent>
        </Card>
      )}

      {savedPlaylists.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Locally Saved Playlists</CardTitle>
            <CardDescription>These playlists are saved in this session. Refreshing the page will clear them.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {savedPlaylists.map(playlist => (
                <li key={playlist.id} className="p-3 border rounded-md hover:bg-muted/50">
                  <h4 className="font-semibold">{playlist.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {playlist.items.length} tracks, saved at {new Date(playlist.savedAt).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 