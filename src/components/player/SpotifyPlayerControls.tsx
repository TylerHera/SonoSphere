'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useSpotifyPlayer } from '@/components/providers/SpotifyPlayerProvider';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider'; // Ensure this is installed via shadcn/ui

export const SpotifyPlayerControls: React.FC = () => {
  const {
    isPlaying,
    isReady,
    isActive,
    play,
    pause,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
  } = useSpotifyPlayer();

  const handlePlayPause = () => {
    if (!isReady || !isActive) return;
    if (isPlaying) {
      pause();
    } else {
      play(); // Resumes or plays the current context. To play a specific track, pass URIs.
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!isReady) return;
    setVolume(value[0]);
  };

  if (!isReady) {
    return (
      <div className="text-sm text-muted-foreground">
        Player not ready. Ensure Spotify is open.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-md">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousTrack}
          disabled={!isActive}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={!isActive}
          className="w-12 h-12"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextTrack}
          disabled={!isActive}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 w-full">
        {volume > 0 ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
        <Slider
          defaultValue={[volume]}
          max={1}
          step={0.05}
          onValueChange={handleVolumeChange}
          className="w-full"
          disabled={!isActive}
        />
      </div>
      {/* TODO: Add progress bar, shuffle, repeat controls */}
    </div>
  );
};
