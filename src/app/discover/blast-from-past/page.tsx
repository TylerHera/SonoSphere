'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserTopTracks, getUserRecentTracks } from '@/lib/api/lastfm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

const FORGOTTEN_TRACKS_COUNT = 20;
const RECENT_TRACKS_TO_CHECK = 100; // Check against more recent tracks
const TOP_TRACKS_POOL_SIZE = 200; // Fetch a larger pool of top tracks

export default function BlastFromPastPage() {
  const { session } = useAuth();
  const [forgottenTracks, setForgottenTracks] = useState<LastFM.TopTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForgottenTracks = async () => {
      if (!session?.user?.user_metadata?.lastfm_username) {
        setError(
          'Last.fm username not found in your profile. Please connect Last.fm in settings.',
        );
        setIsLoading(false);
        return;
      }

      const lastfmUsername = session.user.user_metadata.lastfm_username;
      setIsLoading(true);
      setError(null);

      try {
        const [topTracksResponse, recentTracksResponse] = await Promise.all([
          getUserTopTracks(lastfmUsername, 'overall', TOP_TRACKS_POOL_SIZE),
          getUserRecentTracks(lastfmUsername, RECENT_TRACKS_TO_CHECK, 1, 0), // extended=0 is fine, we only need names
        ]);

        if ('error' in topTracksResponse) {
          throw new Error(
            `Error fetching top tracks: ${topTracksResponse.message}`,
          );
        }
        if ('error' in recentTracksResponse) {
          throw new Error(
            `Error fetching recent tracks: ${recentTracksResponse.message}`,
          );
        }

        const topTracks = topTracksResponse.toptracks?.track || [];
        const recentTracks = recentTracksResponse.recenttracks?.track || [];

        if (topTracks.length === 0) {
          setForgottenTracks([]);
          toast.info('No top tracks found to pick blasts from the past.');
          return;
        }

        const recentTrackIdentifiers = new Set(
          recentTracks.map(
            (track) =>
              `${track.artist['#text'] ? track.artist['#text'].toLowerCase() : 'unknown artist'}_${track.name.toLowerCase()}`,
          ),
        );

        const forgotten = topTracks.filter((track) => {
          const artistName = track.artist.name || 'unknown artist';
          const trackIdentifier = `${artistName.toLowerCase()}_${track.name.toLowerCase()}`;
          return !recentTrackIdentifiers.has(trackIdentifier);
        });

        setForgottenTracks(forgotten.slice(0, FORGOTTEN_TRACKS_COUNT));
      } catch (err: any) {
        console.error('Failed to fetch forgotten tracks:', err);
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'Failed to load Blasts from the Past.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForgottenTracks();
  }, [session]);

  const handlePlayTrack = (track: LastFM.TopTrack) => {
    // Placeholder - integrate with player context
    toast.info(`Playing: ${track.name} by ${track.artist.name} (TODO)`);
    console.log('Play track:', track);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
        <p className="mt-4 text-muted-foreground">
          Digging up your forgotten favorites...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            {error.includes('Last.fm username not found') && (
              <Button asChild className="mt-4">
                <Link href="/settings/connections">Go to Settings</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (forgottenTracks.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Forgotten Favorites Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We couldn&apos;t find any tracks that seem to be forgotten
              favorites right now. Maybe listen to more music and check back
              later!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Blasts From The Past</CardTitle>
          <CardDescription>
            Rediscover these gems you haven&apos;t listened to in a while!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forgottenTracks.map((track) => (
              <Card
                key={`${track.artist.mbid || track.artist.name}-${track.mbid || track.name}`}
                className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4 flex-grow min-w-0">
                  {track.image?.[2]?.['#text'] && (
                    <Image
                      src={track.image[2]['#text']}
                      alt={track.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-grow min-w-0">
                    <h3
                      className="font-semibold text-lg truncate"
                      title={track.name}
                    >
                      {track.name}
                    </h3>
                    <Link
                      href={track.artist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline truncate"
                      title={track.artist.name}
                    >
                      {track.artist.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Playcount: {track.playcount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <Button
                    variant={'ghost' as any}
                    size="sm"
                    onClick={() => handlePlayTrack(track)}
                  >
                    Play (TODO)
                  </Button>
                  <Button asChild variant={'outline' as any} size="sm">
                    <Link
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Last.fm
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
