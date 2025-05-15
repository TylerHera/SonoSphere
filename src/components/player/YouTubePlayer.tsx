"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { loadYouTubeIframeAPI, createYouTubePlayer, YouTubePlayerOptions } from '@/lib/api/youtube';

interface YouTubePlayerProps extends Omit<YouTubePlayerOptions, 'events' | 'width' | 'height'> {
  videoId: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  // Add other event props as needed
}

export interface YouTubePlayerRef {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => number | undefined;
  getCurrentTime: () => number | undefined;
  getDuration: () => number | undefined;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  // Add more control methods as needed
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>((
  { videoId, className, width = '100%', height = '100%', playerVars, onReady, onStateChange, onError }, 
  ref
) => {
  const playerRef = useRef<any | null>(null); // Stores the YouTube player instance
  const playerContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the div where player will be mounted
  const [isApiReady, setIsApiReady] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);

  useEffect(() => {
    loadYouTubeIframeAPI()
      .then(() => setIsApiReady(true))
      .catch(err => console.error("Error loading YouTube API in component:", err));
  }, []);

  useEffect(() => {
    setCurrentVideoId(videoId); // Update currentVideoId if prop changes
  }, [videoId]);

  useEffect(() => {
    if (isApiReady && playerContainerRef.current && currentVideoId) {
      // Ensure a unique ID for the player div if multiple players are on the page
      const playerElementId = `youtube-player-${currentVideoId}-${Math.random().toString(36).substring(7)}`;
      if (playerContainerRef.current) {
          playerContainerRef.current.id = playerElementId;
      }

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        // playerRef.current.destroy(); // Destroy previous instance if any
        // console.log("Previous YT player destroyed or was null");
      }

      createYouTubePlayer(playerElementId, {
        videoId: currentVideoId,
        width: String(width),
        height: String(height),
        playerVars,
        events: {
          onReady: (event) => {
            playerRef.current = event.target; // Store player instance
            if (onReady) onReady(event);
          },
          onStateChange: onStateChange,
          onError: onError,
        },
      }).catch(err => console.error("Error creating YouTube player:", err));
      
      return () => {
        // Cleanup: Destroy the player when the component unmounts or videoId changes
        // if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        //   playerRef.current.destroy();
        //   playerRef.current = null;
        //   console.log("YT player destroyed on cleanup");
        // }
      };
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiReady, currentVideoId, width, height, playerVars]); // Re-create player if these change, onReady/StateChange/Error are stable refs

  useImperativeHandle(ref, () => ({
    playVideo: () => playerRef.current?.playVideo(),
    pauseVideo: () => playerRef.current?.pauseVideo(),
    stopVideo: () => playerRef.current?.stopVideo(),
    seekTo: (seconds, allowSeekAhead) => playerRef.current?.seekTo(seconds, allowSeekAhead),
    getPlayerState: () => playerRef.current?.getPlayerState(),
    getCurrentTime: () => playerRef.current?.getCurrentTime(),
    getDuration: () => playerRef.current?.getDuration(),
    loadVideoById: (newVideoId, startSeconds) => playerRef.current?.loadVideoById(newVideoId, startSeconds),
  }));

  return <div ref={playerContainerRef} className={className} />;
});

YouTubePlayer.displayName = 'YouTubePlayer';

export { YouTubePlayer }; 