'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserTopTracks, getUserRecentTracks } from '@/lib/api/lastfm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImage } from '@/lib/utils';

const DEFAULT_PERIOD = '1month'; // Can be '7day', '1month', '3month', '6month', '12month', 'overall'
const RECENT_TRACKS_LIMIT = 200; // How many recent tracks to fetch for comparison
const FORGOTTEN_TRACKS_DISPLAY_LIMIT = 20;

// Define the type for the period parameter
type LastFMPeriod =
  | '7day'
  | '1month'
  | '3month'
  | '6month'
  | '12month'
  | 'overall';

export default function BlastFromPastPage() {
  const { session, user } = useAuth();
  const [lastfmUsername, setLastfmUsername] = useState<string | null>(null);
  const [lastfmSessionKey, setLastfmSessionKey] = useState<string | null>(null);
  const [forgottenTracks, setForgottenTracks] = useState<LastFM.TopTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<LastFMPeriod>(
    DEFAULT_PERIOD as LastFMPeriod,
  );

  useEffect(() => {
    if (user) {
      const usernameFromMeta = user.user_metadata?.lastfm_username as
        | string
        | undefined;
      const sessionKeyFromMeta = user.user_metadata?.lastfm_session_key as
        | string
        | undefined;

      setLastfmUsername(usernameFromMeta || null);
      setLastfmSessionKey(sessionKeyFromMeta || null);

      if (!usernameFromMeta || !sessionKeyFromMeta) {
        setError('Last.fm username or session key not found in user profile.');
      }
    } else {
      setLastfmUsername(null);
      setLastfmSessionKey(null);
    }
  }, [user]);

  useEffect(() => {
    const fetchForgottenTracks = async () => {
      if (!lastfmUsername || !lastfmSessionKey) {
        setError(
          'Last.fm account not connected or session key missing. Please connect in settings and ensure profile data is synced.',
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [topTracksResponse, recentTracksResponse] = await Promise.all([
          getUserTopTracks(lastfmUsername, period, 100, 1),
          getUserRecentTracks(lastfmUsername, RECENT_TRACKS_LIMIT, 1, 0),
        ]);

        let topTracks: LastFM.TopTrack[] = [];
        if (
          topTracksResponse &&
          !('error' in topTracksResponse) &&
          topTracksResponse.toptracks
        ) {
          topTracks = topTracksResponse.toptracks.track;
        } else if (topTracksResponse && 'error' in topTracksResponse) {
          throw new Error(
            `Failed to fetch top tracks: ${topTracksResponse.message}`,
          );
        }

        let recentTracks: LastFM.RecentTrack[] = [];
        if (
          recentTracksResponse &&
          !('error' in recentTracksResponse) &&
          recentTracksResponse.recenttracks
        ) {
          recentTracks = recentTracksResponse.recenttracks.track;
        } else if (recentTracksResponse && 'error' in recentTracksResponse) {
          throw new Error(
            `Failed to fetch recent tracks: ${recentTracksResponse.message}`,
          );
        }

        if (topTracks.length === 0) {
          setForgottenTracks([]);
          setIsLoading(false);
          toast.info(
            `No top tracks found for the period: ${period}. Try a different period.`,
          );
          return;
        }

        const recentTrackIdentifiers = new Set<string>();
        recentTracks.forEach((track) => {
          const artistName =
            track.artist && track.artist['#text']
              ? track.artist['#text']
              : 'unknown artist';
          recentTrackIdentifiers.add(
            `${artistName.toLowerCase()}_${track.name.toLowerCase()}`,
          );
        });

        const forgotten = topTracks.filter((track) => {
          const artistName =
            track.artist && track.artist['#text']
              ? track.artist['#text']
              : 'unknown artist';
          const trackIdentifier = `${artistName.toLowerCase()}_${track.name.toLowerCase()}`;
          return !recentTrackIdentifiers.has(trackIdentifier);
        });

        setForgottenTracks(forgotten.slice(0, FORGOTTEN_TRACKS_DISPLAY_LIMIT));

        if (forgotten.length === 0) {
          toast.info(
            'All your top tracks from this period seem to have been played recently!',
          );
        }
      } catch (err: any) {
        console.error('Error fetching forgotten tracks:', err);
        setError(err.message || 'Failed to fetch forgotten tracks.');
        toast.error(err.message || 'Failed to fetch forgotten tracks.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForgottenTracks();
  }, [lastfmUsername, lastfmSessionKey, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as LastFMPeriod);
  };

  if (!user && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="mb-4">
          Please log in and connect your Last.fm account in settings to use this
          feature.
        </p>
        <Link href="/settings/connections">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
        <p className="mt-4 text-muted-foreground">
          Digging through your archives...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button
          onClick={() => setPeriod(DEFAULT_PERIOD as LastFMPeriod)}
          className="mt-4"
        >
          Try Again with Default Period
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blasts From The Past</h1>
          <p className="text-muted-foreground">
            Rediscover tracks from your Last.fm history you haven&apos;t
            listened to recently.
          </p>
        </div>
        <div className="flex space-x-2">
          {['7day', '1month', '3month', '6month', '12month', 'overall'].map(
            (p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                onClick={() => handlePeriodChange(p)}
              >
                {p.replace('month', 'M').replace('day', 'D')}
              </Button>
            ),
          )}
        </div>
      </div>

      {forgottenTracks.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">
          No forgotten tracks found for the period &quot;{period}&quot;. Either
          everything is fresh or no data found.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {forgottenTracks.map((track) => (
          <Card
            key={track.mbid || `${track.artist?.['#text']}-${track.name}`}
            className="flex flex-col"
          >
            <CardHeader className="p-4">
              <div className="relative aspect-square w-full mb-2">
                <Image
                  src={
                    track.image.find(
                      (img: LastFM.Image) => img.size === 'extralarge',
                    )?.['#text'] || placeholderImage(200, 200)
                  }
                  alt={`Cover for ${track.name}`}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                  className="object-cover rounded-md"
                />
              </div>
              <CardTitle
                className="text-lg leading-tight truncate"
                title={track.name}
              >
                {track.name}
              </CardTitle>
              <CardDescription
                className="truncate"
                title={track.artist?.['#text']}
              >
                {track.artist?.['#text']}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <p className="text-sm text-muted-foreground">
                Playcount ({period}): {track.playcount}
              </p>
            </CardContent>
            {/* Add action buttons if needed, e.g., play on Spotify/Apple Music */}
          </Card>
        ))}
      </div>
    </div>
  );
}
