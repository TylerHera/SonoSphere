'use client';

import React from 'react';
import Image from 'next/image';
import { useSpotifyPlayer } from '@/components/providers/SpotifyPlayerProvider';
import { placeholderImage } from '@/lib/utils';

export const NowPlayingDisplay: React.FC = () => {
  const { currentTrack, isActive } = useSpotifyPlayer();

  if (!isActive || !currentTrack) {
    return <div className="text-sm text-muted-foreground">Nothing playing</div>;
  }

  const trackName = currentTrack.name;
  const artistName = currentTrack.artists.map(artist => artist.name).join(', ');
  const albumArtUrl = currentTrack.album.images[0]?.url || placeholderImage(64, 64);

  return (
    <div className="flex items-center space-x-3">
      <Image 
        src={albumArtUrl} 
        alt={trackName || 'Album art'} 
        width={56} 
        height={56} 
        className="rounded"
        unoptimized={albumArtUrl.startsWith('http')} // only optimize local placeholders
      />
      <div>
        <p className="font-semibold truncate w-48" title={trackName}>{trackName}</p>
        <p className="text-sm text-muted-foreground truncate w-48" title={artistName}>{artistName}</p>
      </div>
    </div>
  );
}; 