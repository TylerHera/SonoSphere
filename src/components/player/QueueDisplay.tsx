'use client';

import React from 'react';
import { useSpotifyPlayer } from '@/components/providers/SpotifyPlayerProvider';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming scroll-area is added
import { Button } from '@/components/ui/button';
import { ListMusic } from 'lucide-react';

export const QueueDisplay: React.FC = () => {
  const { currentTrack } = useSpotifyPlayer();
  // Accessing playerState directly from a hypothetical, more detailed context if needed
  // For now, let's assume track_window is available from the basic playerState.currentTrack or similar
  // const { track_window } = playerState; // This would be from a more detailed Spotify.PlaybackState

  // Placeholder: The current SDK state might not directly expose the full queue easily.
  // This often requires separate API calls to get user's queue or upcoming tracks in a playlist/album context.
  // For this placeholder, we will just show next tracks if available in track_window.

  // const nextTracks = playerState.track_window?.next_tracks || []; // This is illustrative
  // const previousTracks = playerState.track_window?.previous_tracks || [];

  // For a real queue, you would fetch `https://api.spotify.com/v1/me/player/queue`
  // This requires additional state management and API calls.

  if (!currentTrack) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <ListMusic className="mx-auto h-8 w-8 mb-2" />
        No queue information available.
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="text-lg font-semibold mb-2 px-3">Up Next</h3>
      <ScrollArea className="h-[200px] w-full">
        <div className="p-3 space-y-2">
          {/* This is a placeholder. Real queue data would be mapped here */}
          <p className="text-sm text-muted-foreground p-2 border rounded">
            Queue functionality (viewing next tracks, drag-and-drop) will be
            implemented later.
          </p>
          {/* Example of how one might list next tracks if available from SDK state */}
          {/* {nextTracks.length > 0 ? nextTracks.map((track, index) => (
                <div key={track.uri + index} className="p-2 border rounded hover:bg-muted">
                    <p className="text-sm font-medium truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {track.artists.map(a => a.name).join(', ')}
                    </p>
                </div>
            )) : (
                <p className="text-sm text-muted-foreground p-2">
                    No tracks in the up next queue.
                </p>
            )} */}
        </div>
      </ScrollArea>
      <div className="mt-2 px-3">
        <Button variant="outline" size="sm" className="w-full" disabled>
          Manage Queue (Coming Soon)
        </Button>
      </div>
    </div>
  );
};
