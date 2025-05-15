// src/lib/api/youtube.ts

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerOptions {
  height?: string;
  width?: string;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1 | 2;
    // Add more playerVars as needed from YouTube API documentation
    [key: string]: any;
  };
  events?: {
    onReady?: (event: any) => void;
    onStateChange?: (event: any) => void;
    onError?: (event: any) => void;
    // Add more event handlers
  };
}

let iframeApiLoaded: Promise<void> | null = null;

export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error("YouTube IFrame API can only be loaded on the client-side."));
  }

  if (iframeApiLoaded) {
    return iframeApiLoaded;
  }

  iframeApiLoaded = new Promise<void>((resolve, reject) => {
    // Check if the API is already loaded by chance
    if (window.YT && window.YT.Player) {
      return resolve();
    }

    const scriptTag = document.createElement('script');
    scriptTag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
    } else {
        // Fallback if no script tags are found (should be rare)
        document.head.appendChild(scriptTag);
    }
    
    scriptTag.onerror = (error) => {
        console.error("Failed to load YouTube IFrame API script:", error);
        iframeApiLoaded = null; // Reset promise on error
        reject(new Error("Failed to load YouTube IFrame API script."));
    };

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API ready.");
      resolve();
    };
  });

  return iframeApiLoaded;
}

export async function createYouTubePlayer(elementId: string, options: YouTubePlayerOptions): Promise<any> {
  await loadYouTubeIframeAPI();
  return new Promise((resolve, reject) => {
    if (!window.YT) {
        return reject(new Error("YT object not available on window"));
    }
    try {
        const player = new window.YT.Player(elementId, {
            height: options.height || '390',
            width: options.width || '640',
            videoId: options.videoId,
            playerVars: options.playerVars || { autoplay: 0, controls: 1 },
            events: {
                onReady: (event: any) => {
                    if (options.events?.onReady) options.events.onReady(event);
                    resolve(player); // Resolve with the player instance once ready
                },
                onStateChange: options.events?.onStateChange,
                onError: options.events?.onError,
            },
        });
    } catch (error) {
        reject(error);
    }
  });
}

// Helper functions to control the player instance can be added here
// e.g., playVideo(player), pauseVideo(player), loadVideoById(player, videoId)
// These would assume you have a reference to the player object returned by createYouTubePlayer 