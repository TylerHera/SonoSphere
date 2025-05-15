'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Musixmatch } from '@/types/musixmatch';
import { parseLRC, findCurrentLyricLineIndex } from '@/lib/utils/lyrics';

interface LyricsDisplayProps {
  lrcLyrics?: string | null; // Raw LRC string
  parsedLyrics?: Musixmatch.LyricsLine[] | null; // Or pre-parsed lyrics
  currentTime: number; // Current playback time in seconds
  isPlaying: boolean;
  className?: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lrcLyrics,
  parsedLyrics,
  currentTime,
  isPlaying,
  className = '',
}) => {
  const [lines, setLines] = useState<Musixmatch.LyricsLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const activeLineRef = useRef<HTMLLIElement>(null);
  const lyricsContainerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (parsedLyrics) {
      setLines(parsedLyrics);
    } else if (lrcLyrics) {
      setLines(parseLRC(lrcLyrics));
    } else {
      setLines([]);
    }
  }, [lrcLyrics, parsedLyrics]);

  useEffect(() => {
    if (lines.length > 0 && isPlaying) {
      const newIndex = findCurrentLyricLineIndex(lines, currentTime);
      setCurrentLineIndex(newIndex);
    }
  }, [lines, currentTime, isPlaying]);

  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = activeLineRef.current;

      // Scroll to keep the active line somewhat centered
      const scrollPosition =
        activeLine.offsetTop -
        container.offsetTop -
        container.clientHeight / 2 +
        activeLine.clientHeight / 2;

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [currentLineIndex]);

  if (!lines.length) {
    return (
      <p className={`text-center text-muted-foreground ${className}`}>
        No lyrics available.
      </p>
    );
  }

  return (
    <ul
      ref={lyricsContainerRef}
      className={`lyrics-display space-y-2 overflow-y-auto h-64 md:h-96 p-4 rounded-md bg-background/50 ${className}`}
    >
      {lines.map((line, index) => (
        <li
          key={index} // Using index as key for simplicity, assuming lines don't reorder
          ref={index === currentLineIndex ? activeLineRef : null}
          className={`
            transition-all duration-300 ease-in-out text-lg md:text-xl text-center p-2 rounded-md
            ${
              index === currentLineIndex
                ? 'text-primary font-semibold scale-105 bg-primary/10'
                : 'text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground'
            }
          `}
        >
          {line.text}
        </li>
      ))}
    </ul>
  );
};

export default LyricsDisplay;
