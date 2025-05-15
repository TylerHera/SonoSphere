import type { Musixmatch } from '@/types/musixmatch';

/**
 * Parses LRC formatted lyrics string into an array of LyricsLine objects.
 * Example LRC line: [mm:ss.xx]Lyric text or [mm:ss.xx]Lyric text [mm:ss.xx]Next part
 * This parser handles basic [time]text lines and tries to manage multiple timestamps per line if simple.
 */
export function parseLRC(lrcString: string): Musixmatch.LyricsLine[] {
  const lines: Musixmatch.LyricsLine[] = [];
  if (!lrcString) return lines;

  const lrcLines = lrcString.split('\n');

  for (const line of lrcLines) {
    const timeStampMatches = Array.from(
      line.matchAll(/\[(\d{2,}):(\d{2})(?:[\.:](\d{2,3}))?\]/g),
    );

    if (timeStampMatches.length > 0) {
      // Get text after the last timestamp
      const lastTimestampMatch = timeStampMatches[timeStampMatches.length - 1];
      const text = line
        .substring(lastTimestampMatch.index + lastTimestampMatch[0].length)
        .trim();

      for (const match of timeStampMatches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const hundredthsOrMillis = parseInt(match[3] || '0', 10);

        // Assuming xx is hundredths of a second, convert to total seconds
        // If it's milliseconds (xxx), adjust accordingly (divide by 1000 instead of 100)
        const totalTime =
          minutes * 60 +
          seconds +
          (match[3] && match[3].length === 3
            ? hundredthsOrMillis / 1000
            : hundredthsOrMillis / 100);

        if (!isNaN(totalTime) && text) {
          // Only add if text is not empty after timestamps
          lines.push({
            text,
            time: {
              total: totalTime,
              minutes,
              seconds,
              hundredths:
                match[3] && match[3].length === 2
                  ? hundredthsOrMillis
                  : match[3] && match[3].length === 3
                    ? Math.floor(hundredthsOrMillis / 10)
                    : 0,
            },
          });
        }
      }
    } else {
      // Line without a timestamp, could be metadata or just plain text
      // For simplicity, we can add it with a zero timestamp if it contains text
      // or decide to ignore. For karaoke, lines without timestamps are usually ignored.
      // const text = line.trim();
      // if (text) {
      //   lines.push({
      //     text,
      //     time: { total: lines[lines.length -1]?.time.total || 0, minutes: 0, seconds: 0, hundredths: 0 }
      //   });
      // }
    }
  }

  // Sort lines by time, as LRC can have multiple timestamps for one line segment
  return lines.sort((a, b) => a.time.total - b.time.total);
}

/**
 * Finds the index of the current lyric line based on playback time.
 * @param lines Parsed array of Musixmatch.LyricsLine.
 * @param currentTime Current playback time in seconds.
 * @returns The index of the active line, or -1 if not found or before the first line.
 */
export function findCurrentLyricLineIndex(
  lines: Musixmatch.LyricsLine[],
  currentTime: number,
): number {
  if (!lines || lines.length === 0) return -1;

  // If current time is before the first lyric, no line is active yet
  if (currentTime < lines[0].time.total) return -1;

  // Find the last line whose time is less than or equal to the current time
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].time.total <= currentTime) {
      return i;
    }
  }
  return -1; // Should not happen if lines[0].time.total <= currentTime was handled
}
