'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImage } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Simplified DTOs for frontend, matching expected structure from backend
interface LastFmImageFE {
  size: string;
  '#text': string;
}

interface LastFmArtistStatsFE {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  image?: LastFmImageFE[];
  '@attr'?: { rank: string };
}

interface LastFmTrackStatsFE {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  artist: {
    '#text': string;
    mbid?: string;
  };
  image?: LastFmImageFE[];
  '@attr'?: { rank: string };
}

interface LastFmAlbumStatsFE {
    name: string;
    playcount: string;
    mbid?: string;
    url: string;
    artist: {
        '#text': string;
        mbid?: string;
    };
    image?: LastFmImageFE[];
    '@attr'?: { rank: string };
}
// End of DTOs

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type Period = 'overall' | '7day' | '1month' | '3month' | '6month' | '12month';

interface AnalyticsData<T> {
  items: T[];
  total: number;
}

export default function AnalyticsPage() {
  const { user, session } = useAuth();
  const [topArtists, setTopArtists] = useState<AnalyticsData<LastFmArtistStatsFE>>({ items: [], total: 0 });
  const [topTracks, setTopTracks] = useState<AnalyticsData<LastFmTrackStatsFE>>({ items: [], total: 0 });
  const [topAlbums, setTopAlbums] = useState<AnalyticsData<LastFmAlbumStatsFE>>({ items: [], total: 0 });
  const [weeklyTracks, setWeeklyTracks] = useState<LastFmTrackStatsFE[]>([]);
  const [weeklyArtists, setWeeklyArtists] = useState<LastFmArtistStatsFE[]>([]);
  const [weeklyAlbums, setWeeklyAlbums] = useState<LastFmAlbumStatsFE[]>([]);
  const [weeklyDataTimeframe, setWeeklyDataTimeframe] = useState<{ from: string; to: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('overall');

  const fetchAnalyticsData = useCallback(async (period: Period) => {
    if (!user || !session?.access_token || !apiBaseUrl) {
      setError("User not authenticated or API configuration missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const headers = { 'Authorization': `Bearer ${session.access_token}` };
      const limit = 5; // Fetch top 5 for dashboard display

      const [artistsRes, tracksRes, albumsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/analytics/top-artists?period=${period}&limit=${limit}`, { headers }),
        fetch(`${apiBaseUrl}/analytics/top-tracks?period=${period}&limit=${limit}`, { headers }),
        fetch(`${apiBaseUrl}/analytics/top-albums?period=${period}&limit=${limit}`, { headers }),
      ]);

      // Check all responses first
      if (!artistsRes.ok) throw new Error(`Failed to fetch top artists: ${artistsRes.statusText} (status: ${artistsRes.status})`);
      if (!tracksRes.ok) throw new Error(`Failed to fetch top tracks: ${tracksRes.statusText} (status: ${tracksRes.status})`);
      if (!albumsRes.ok) throw new Error(`Failed to fetch top albums: ${albumsRes.statusText} (status: ${albumsRes.status})`);

      const artistsData = await artistsRes.json();
      const tracksData = await tracksRes.json();
      const albumsData = await albumsRes.json();
      
      // Check for backend/Last.fm errors embedded in successful HTTP responses
      if (artistsData.error || tracksData.error || albumsData.error) {
          // Example: Pick first error message
          const errorMessage = artistsData.message || tracksData.message || albumsData.message || "An error occurred in the backend or Last.fm API.";
          throw new Error(errorMessage);
      }

      setTopArtists({ items: artistsData.artists || [], total: artistsData.total || 0 });
      setTopTracks({ items: tracksData.tracks || [], total: tracksData.total || 0 });
      setTopAlbums({ items: albumsData.albums || [], total: albumsData.total || 0 });

      // Fetch weekly data - defaults to most recent week from backend
      const weeklyLimit = 3; // Show top 3 for weekly section
      const [weeklyTracksRes, weeklyArtistsRes, weeklyAlbumsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/analytics/weekly-tracks?limit=${weeklyLimit}`, { headers }), // limit might not be supported by Last.fm API this way, but we take top N from response
        fetch(`${apiBaseUrl}/analytics/weekly-artists?limit=${weeklyLimit}`, { headers }),
        fetch(`${apiBaseUrl}/analytics/weekly-albums?limit=${weeklyLimit}`, { headers }),
      ]);

      if (!weeklyTracksRes.ok) throw new Error(`Failed to fetch weekly tracks: ${weeklyTracksRes.statusText} (status: ${weeklyTracksRes.status})`);
      if (!weeklyArtistsRes.ok) throw new Error(`Failed to fetch weekly artists: ${weeklyArtistsRes.statusText} (status: ${weeklyArtistsRes.status})`);
      if (!weeklyAlbumsRes.ok) throw new Error(`Failed to fetch weekly albums: ${weeklyAlbumsRes.statusText} (status: ${weeklyAlbumsRes.status})`);
      
      const weeklyTracksData = await weeklyTracksRes.json();
      const weeklyArtistsData = await weeklyArtistsRes.json();
      const weeklyAlbumsData = await weeklyAlbumsRes.json();

      if (weeklyTracksData.error || weeklyArtistsData.error || weeklyAlbumsData.error) {
        const weeklyError = weeklyTracksData.message || weeklyArtistsData.message || weeklyAlbumsData.message || "Error fetching weekly data.";
        // Don't throw, but maybe set a specific error for weekly section or log it
        console.warn("Partial error fetching weekly data: ", weeklyError);
      }

      setWeeklyTracks((weeklyTracksData.tracks || []).slice(0, weeklyLimit));
      setWeeklyArtists((weeklyArtistsData.artists || []).slice(0, weeklyLimit));
      setWeeklyAlbums((weeklyAlbumsData.albums || []).slice(0, weeklyLimit));
      
      // Assuming all weekly data shares the same timeframe from Last.fm default response
      if (weeklyTracksData.from && weeklyTracksData.to) {
        setWeeklyDataTimeframe({ from: weeklyTracksData.from, to: weeklyTracksData.to });
      } else if (weeklyArtistsData.from && weeklyArtistsData.to) {
        setWeeklyDataTimeframe({ from: weeklyArtistsData.from, to: weeklyArtistsData.to });
      } else if (weeklyAlbumsData.from && weeklyAlbumsData.to) {
        setWeeklyDataTimeframe({ from: weeklyAlbumsData.from, to: weeklyAlbumsData.to });
      }

    } catch (e: any) {
      console.error("Error fetching analytics data:", e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) { // Ensure user and session are available
        fetchAnalyticsData(selectedPeriod);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session, selectedPeriod]); // Removed fetchAnalyticsData from deps as it causes re-fetch loop

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value as Period);
  };

  if (!user) {
    return (
        <div className="p-4 md:p-6 text-center">
            <p>Please log in to view your listening statistics.</p>
            <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
        </div>
    );
  }
  
  if (isLoading && topArtists.items.length === 0 && topTracks.items.length === 0 && topAlbums.items.length === 0 && weeklyTracks.length === 0 && !error) {
    return <div className="p-4 md:p-6 text-center">Loading your listening statistics...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-center text-destructive">
        <p>{error}</p>
        {error.includes("Last.fm username not found") && 
            <Button asChild className="mt-4"><Link href="/settings/connections">Connect Last.fm</Link></Button>
        }
        </div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Listening Statistics</h1>
        <div>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              <SelectItem value="7day">Last 7 Days</SelectItem>
              <SelectItem value="1month">Last 1 Month</SelectItem>
              <SelectItem value="3month">Last 3 Months</SelectItem>
              <SelectItem value="6month">Last 6 Months</SelectItem>
              <SelectItem value="12month">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Artists */}
        <Card>
          <CardHeader>
            <CardTitle>Top Artists</CardTitle>
            <CardDescription>Your most played artists ({selectedPeriod.replace('day', ' days').replace('month', ' months').replace('overall', 'Overall')}).</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && topArtists.items.length === 0 && <p className="text-muted-foreground">Loading artists...</p>}
            {!isLoading && topArtists.items.length === 0 && !error && <p className="text-muted-foreground">No artist data available for this period.</p>}
            
            {topArtists.items.length > 0 && (
              <>
                <div style={{ width: '100%', height: 200 }} className="mb-4">
                  <ResponsiveContainer>
                    <BarChart data={topArtists.items} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={10} interval={0} />
                      <YAxis allowDecimals={false} fontSize={12}/>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} 
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="playcount" name="Plays" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-3">
                  {topArtists.items.map((artist, index) => (
                    <li key={artist.mbid || artist.name + index} className="flex items-center space-x-3">
                      <Image 
                        src={artist.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                        alt={artist.name} width={40} height={40} className="rounded-full aspect-square object-cover" unoptimized/>
                      <div>
                        <a href={artist.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{artist.name}</a>
                        <p className="text-sm text-muted-foreground">{artist.playcount} plays</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tracks</CardTitle>
            <CardDescription>Your most played tracks ({selectedPeriod.replace('day', ' days').replace('month', ' months').replace('overall', 'Overall')}).</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && topTracks.items.length === 0 && <p className="text-muted-foreground">Loading tracks...</p>}
            {!isLoading && topTracks.items.length === 0 && !error && <p className="text-muted-foreground">No track data available for this period.</p>}
            <ul className="space-y-3">
              {topTracks.items.map((track, index) => (
                <li key={track.mbid || track.name + index} className="flex items-center space-x-3">
                   <Image 
                    src={track.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                    alt={track.name} width={40} height={40} className="rounded aspect-square object-cover" unoptimized/>
                  <div>
                    <a href={track.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{track.name}</a>
                    <p className="text-sm text-muted-foreground">by {track.artist['#text']} - {track.playcount} plays</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Top Albums */}
        <Card>
          <CardHeader>
            <CardTitle>Top Albums</CardTitle>
            <CardDescription>Your most played albums ({selectedPeriod.replace('day', ' days').replace('month', ' months').replace('overall', 'Overall')}).</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && topAlbums.items.length === 0 && <p className="text-muted-foreground">Loading albums...</p>}
            {!isLoading && topAlbums.items.length === 0 && !error && <p className="text-muted-foreground">No album data available for this period.</p>}
            <ul className="space-y-3">
              {topAlbums.items.map((album, index) => (
                <li key={album.mbid || album.name + index} className="flex items-center space-x-3">
                  <Image 
                    src={album.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                    alt={album.name} width={40} height={40} className="rounded aspect-square object-cover" unoptimized/>
                  <div>
                    <a href={album.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{album.name}</a>
                    <p className="text-sm text-muted-foreground">by {album.artist['#text']} - {album.playcount} plays</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Charts Section */}
      {weeklyDataTimeframe && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            This Week's Highlights ({new Date(parseInt(weeklyDataTimeframe.from) * 1000).toLocaleDateString()} - {new Date(parseInt(weeklyDataTimeframe.to) * 1000).toLocaleDateString()})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly Top Artists */}
            <Card>
              <CardHeader>
                <CardTitle>Top Artists This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && weeklyArtists.length === 0 && <p className="text-muted-foreground">Loading...</p>}
                {!isLoading && weeklyArtists.length === 0 && !error && <p className="text-muted-foreground">No data.</p>}
                <ul className="space-y-3">
                  {weeklyArtists.map((artist, index) => (
                    <li key={artist.mbid || artist.name + index} className="flex items-center space-x-3">
                      <Image 
                        src={artist.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                        alt={artist.name} width={40} height={40} className="rounded-full aspect-square object-cover" unoptimized/>
                      <div>
                        <a href={artist.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{artist.name}</a>
                        <p className="text-sm text-muted-foreground">{artist.playcount} plays</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weekly Top Tracks */}
            <Card>
              <CardHeader>
                <CardTitle>Top Tracks This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && weeklyTracks.length === 0 && <p className="text-muted-foreground">Loading...</p>}
                {!isLoading && weeklyTracks.length === 0 && !error && <p className="text-muted-foreground">No data.</p>}
                <ul className="space-y-3">
                  {weeklyTracks.map((track, index) => (
                    <li key={track.mbid || track.name + index} className="flex items-center space-x-3">
                      <Image 
                        src={track.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                        alt={track.name} width={40} height={40} className="rounded aspect-square object-cover" unoptimized/>
                      <div>
                        <a href={track.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{track.name}</a>
                        <p className="text-sm text-muted-foreground">by {track.artist['#text']} - {track.playcount} plays</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weekly Top Albums */}
            <Card>
              <CardHeader>
                <CardTitle>Top Albums This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && weeklyAlbums.length === 0 && <p className="text-muted-foreground">Loading...</p>}
                {!isLoading && weeklyAlbums.length === 0 && !error && <p className="text-muted-foreground">No data.</p>}
                <ul className="space-y-3">
                  {weeklyAlbums.map((album, index) => (
                    <li key={album.mbid || album.name + index} className="flex items-center space-x-3">
                      <Image 
                        src={album.image?.find(img => img.size === 'medium')?.['#text'] || placeholderImage(40,40)}
                        alt={album.name} width={40} height={40} className="rounded aspect-square object-cover" unoptimized/>
                      <div>
                        <a href={album.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{album.name}</a>
                        <p className="text-sm text-muted-foreground">by {album.artist['#text']} - {album.playcount} plays</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 