'use client';

import React from 'react';
import { useSpotifyPlayer } from '@/components/providers/SpotifyPlayerProvider';
import { NowPlayingDisplay } from './NowPlayingDisplay';
import { SpotifyPlayerControls } from './SpotifyPlayerControls';
import { QueueDisplay } from './QueueDisplay';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ListOrdered } from 'lucide-react';

export const SpotifyPlayer: React.FC = () => {
  const { isReady, deviceId, session } = useSpotifyPlayer(); // session from useAuth via useSpotifyPlayer

  // Only show the player if the SDK is ready and we have a device ID, and user is logged in via Spotify
  // Check for session and provider_token to ensure user has authenticated with Spotify
  const spotifyAuthenticated = session?.provider_token;

  if (!isReady || !deviceId || !spotifyAuthenticated) {
    // You might want a more subtle way to handle this, or specific messages.
    // For instance, if !spotifyAuthenticated, prompt to connect Spotify.
    // If !isReady, it might be initializing.
    // If !deviceId, player is not available on this device yet.
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="w-1/3">
          <NowPlayingDisplay />
        </div>
        <div className="w-1/3 flex justify-center">
          <SpotifyPlayerControls />
        </div>
        <div className="w-1/3 flex justify-end items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <ListOrdered className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[350px] sm:w-[450px]">
              <SheetHeader>
                <SheetTitle>Playback Queue</SheetTitle>
                <SheetDescription>
                  View and manage your upcoming tracks.
                </SheetDescription>
              </SheetHeader>
              <QueueDisplay />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
