/// <reference types="../../types/lastfm" />

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { getUserRecentTracks } from '@/lib/api/lastfm';
import { placeholderImage } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ManualScrobbleForm } from './components/ManualScrobbleForm';

const ITEMS_PER_PAGE = 20;

export default function ScrobblesPage() {
  const { user } = useAuth();
  const [lastfmUsername, setLastfmUsername] = useState<string | null>(null);
  const [lastfmSessionKey, setLastfmSessionKey] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<LastFM.RecentTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchLastfmProfileData = useCallback(async () => {
    if (user) {
      const supabase = createClient();
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('lastfm_username, lastfm_session_key')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching Last.fm profile data:", profileError);
        setError("Could not fetch your Last.fm profile data.");
        setIsLoading(false);
        return false;
      }
      if (data?.lastfm_username) {
        setLastfmUsername(data.lastfm_username);
      }
      if (data?.lastfm_session_key) {
        setLastfmSessionKey(data.lastfm_session_key);
      }
      if (!data?.lastfm_username || !data?.lastfm_session_key) {
        setError("Last.fm account not fully connected or username/session key not found. Please connect in Settings.");
        setIsLoading(false);
        return false;
      }
      return true;
    }
    return false;
  }, [user]);

  const fetchScrobbles = useCallback(async () => {
    if (!lastfmUsername) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const response = await getUserRecentTracks(lastfmUsername, ITEMS_PER_PAGE, currentPage);
    if ('error' in response) {
      console.error("Error fetching recent tracks:", response.message);
      setError(`Failed to fetch scrobbles: ${response.message}`);
      // toast.error(`Failed to fetch scrobbles: ${response.message}`);
    } else {
      setRecentTracks(response.recenttracks.track);
      const total = parseInt(response.recenttracks['@attr'].totalPages, 10)
      setTotalPages(isNaN(total) || total === 0 ? 1 : total);
    }
    setIsLoading(false);
  }, [lastfmUsername, currentPage]);

  useEffect(() => {
    fetchLastfmProfileData().then(success => {
      if (success && lastfmUsername) {
      } else if (user && !success) {
        setIsLoading(false);
      } else if (!user) {
        setIsLoading(false);
        setError("Please log in to view scrobbles.");
      }
    });
  }, [user, fetchLastfmProfileData, lastfmUsername]);

  useEffect(() => {
    if (lastfmUsername) {
      fetchScrobbles();
    }
  }, [lastfmUsername, currentPage, fetchScrobbles]);

  const handleScrobbleSubmitted = () => {
    // toast.info("Refreshing scrobble list...");
    fetchScrobbles();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading && !recentTracks.length && !error) {
    return <div className="p-4 md:p-6 text-center">Loading scrobble history...</div>;
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-destructive">{error}</p>
        {(!lastfmUsername || !lastfmSessionKey) && user && (
          <Button asChild className="mt-4">
            <Link href="/settings/connections">Go to Connections</Link>
          </Button>
        )}
      </div>
    );
  }
  
  if (!lastfmUsername && !isLoading) {
     return (
        <div className="p-4 md:p-6 text-center">
            <p>Please connect your Last.fm account in settings to view or add scrobbles.</p>
            <Button asChild className="mt-4">
                <Link href="/settings/connections">Go to Connections</Link>
            </Button>
        </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scrobble History {lastfmUsername && `(${lastfmUsername})`}</h1>
        {lastfmSessionKey && (
            <ManualScrobbleForm 
                lastfmSessionKey={lastfmSessionKey} 
                onScrobbleSubmitted={handleScrobbleSubmitted} 
            />
        )}
      </div>
      
      {recentTracks.length === 0 && !isLoading && (
         <div className="p-4 md:p-6 text-center">No scrobbles found for {lastfmUsername}. You can add one manually.</div>
      )}

      {recentTracks.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {recentTracks.map((track, index) => (
            <Card key={index + (track.date?.uts || track.mbid || track.name + track.artist['#text'])}>
              <CardContent className="p-4 flex items-center space-x-4">
                <Image 
                  src={track.image.find((img: LastFM.Image) => img.size === 'large')?.['#text'] || placeholderImage(64,64)}
                  alt={track.album?.['#text'] || track.name}
                  width={64}
                  height={64}
                  className="rounded aspect-square object-cover"
                  unoptimized={!!track.image.find((img: LastFM.Image) => img.size === 'large')?.['#text']}
                />
                <div className="flex-grow">
                  <CardTitle className="text-lg leading-tight">{track.name}</CardTitle>
                  <CardDescription>{track.artist['#text']}</CardDescription>
                  {track.album?.['#text'] && <p className="text-xs text-muted-foreground">{track.album['#text']}</p>}
                  <p className="text-xs text-muted-foreground">
                    {track['@attr']?.nowplaying === 'true' 
                      ? <span className="text-green-500 font-semibold">Now Playing</span> 
                      : track.date?.['#text'] || 'Recently Scrobbed'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={track.url} target="_blank" rel="noopener noreferrer" title="View on Last.fm">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && recentTracks.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Button onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
            Previous
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 