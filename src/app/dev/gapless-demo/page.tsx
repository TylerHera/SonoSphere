'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Placeholder: In a real scenario, these would be URLs to actual audio files.
// For testing, you would need to replace these with accessible audio file URLs.
const AUDIO_FILE_1 = '/audio/sample_part1.mp3'; // Replace with actual path/URL
const AUDIO_FILE_2 = '/audio/sample_part2.mp3'; // Replace with actual path/URL

const GaplessDemoPage = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('Idle. Load audio files to test.');
  const [crossfadeDuration, setCrossfadeDuration] = useState(3); // Default 3 seconds
  const [playbackRate, setPlaybackRate] = useState(1); // Default 1x speed

  const source1Ref = useRef<AudioBufferSourceNode | null>(null);
  const gain1Ref = useRef<GainNode | null>(null);
  const source2Ref = useRef<AudioBufferSourceNode | null>(null);
  const gain2Ref = useRef<GainNode | null>(null);
  
  const buffer1Ref = useRef<AudioBuffer | null>(null);
  const buffer2Ref = useRef<AudioBuffer | null>(null);
  
  const isCrossfadingRef = useRef(false); // To prevent multiple stop/play chains during crossfade

  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const cleanupSources = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    source1Ref.current?.stop();
    source1Ref.current?.disconnect();
    gain1Ref.current?.disconnect();
    source1Ref.current = null;
    gain1Ref.current = null;

    source2Ref.current?.stop();
    source2Ref.current?.disconnect();
    gain2Ref.current?.disconnect();
    source2Ref.current = null;
    gain2Ref.current = null;
  }, []);

  useEffect(() => {
    // Initialize AudioContext on client side
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);

    const analyser = context.createAnalyser();
    analyser.fftSize = 256; // Smaller FFT size for fewer bars, adjust as needed
    analyser.connect(context.destination); // Connect analyser to output
    analyserRef.current = analyser;

    return () => {
      cleanupSources();
      audioContext?.close();
      analyserRef.current?.disconnect();
    };
  }, [cleanupSources, audioContext]); // Added audioContext to dependency array for its close method

  const drawVisualizer = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current || !isPlaying) {
      if (canvasRef.current) { // Clear canvas if not playing
        const canvasCtx = canvasRef.current.getContext('2d');
        if (canvasCtx) {
            canvasCtx.fillStyle = '#1f2937'; // bg-gray-800 or similar
            canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      animationFrameIdRef.current = null; // Stop animation loop if not playing
      return;
    }

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#111827'; // Dark background, e.g. gray-900
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * (canvas.height / 256); // Scale height
      
      // Simple gradient or color based on height
      const g = Math.floor(barHeight + 50); // Green component
      const r = Math.floor(255 - barHeight); // Red component
      canvasCtx.fillStyle = `rgb(${r},${g},50)`;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1; // Bar width + spacing
    }

    animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
  }, [isPlaying]); // Depend on isPlaying to start/stop loop

  useEffect(() => {
    if (isPlaying) {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
    } else {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
        drawVisualizer(); // Call once to clear canvas when stopping
    }
    return () => {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isPlaying, drawVisualizer]);

  const loadAudio = async (url: string): Promise<AudioBuffer | null> => {
    if (!audioContext) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error: any) {
      console.error("Error loading audio:", error);
      toast.error(`Error loading audio ${url.split('/').pop()}: ${error.message}. Check console & ensure files exist at public/audio/`);
      return null;
    }
  };

  const handleLoadAndPrepare = async () => {
    if (!audioContext) {
      toast.error("AudioContext not initialized.");
      return;
    }
    setIsLoading(true);
    setStatus('Loading audio files...');

    const [b1, b2] = await Promise.all([
      loadAudio(AUDIO_FILE_1),
      loadAudio(AUDIO_FILE_2)
    ]);

    if (b1 && b2) {
      buffer1Ref.current = b1;
      buffer2Ref.current = b2;
      setStatus('Audio files loaded. Ready to play.');
      toast.success('Audio files loaded successfully!');
    } else {
      setStatus('Failed to load one or both audio files. Check console.');
    }
    setIsLoading(false);
  };
  
  // Common play setup
  const setupAndPlaySource = (sourceRef: React.MutableRefObject<AudioBufferSourceNode | null>,
                              gainRef: React.MutableRefObject<GainNode | null>,
                              buffer: AudioBuffer,
                              startTime: number,
                              initialGain: number = 1,
                              currentPlaybackRate: number = 1) => {
    if (!audioContext || !analyserRef.current) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = currentPlaybackRate;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(initialGain, audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(analyserRef.current);
    
    source.start(startTime);
    sourceRef.current = source;
    gainRef.current = gainNode;
    return { source, gainNode };
  };

  useEffect(() => {
    if (source1Ref.current) {
      source1Ref.current.playbackRate.value = playbackRate;
    }
    if (source2Ref.current) {
      source2Ref.current.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayGapless = () => {
    if (!audioContext || !buffer1Ref.current || !buffer2Ref.current) {
      toast.error("Audio not loaded or AudioContext not ready.");
      return;
    }
    if (isPlaying) {
        toast.info("Playback already in progress or initiated.");
        return;
    }
    cleanupSources();
    isCrossfadingRef.current = false;
    if (audioContext.state === 'suspended') audioContext.resume();

    const startTime = audioContext.currentTime + 0.1;
    const s1Data = setupAndPlaySource(source1Ref, gain1Ref, buffer1Ref.current, startTime, 1, playbackRate);
    if (!s1Data) return;

    s1Data.source.onended = () => {
      if (source1Ref.current === s1Data.source && !isCrossfadingRef.current) { // Ensure it's the current one and not part of a crossfade stop
        setStatus('Track 1 finished. Starting Track 2.');
        const s2Data = setupAndPlaySource(source2Ref, gain2Ref, buffer2Ref.current!, audioContext.currentTime, 1, playbackRate);
        if (s2Data) {
            s2Data.source.onended = () => {
                if (source2Ref.current === s2Data.source) {
                    setStatus('Track 2 finished. Playback complete.');
                    setIsPlaying(false);
                }
            };
        }
      }
    };
    setStatus('Playing Track 1 (Gapless)...');
    setIsPlaying(true);
    toast.info("Gapless playback started.");
  };

  const handlePlayCrossfade = () => {
    if (!audioContext || !buffer1Ref.current || !buffer2Ref.current) {
      toast.error("Audio not loaded or AudioContext not ready.");
      return;
    }
     if (isPlaying) {
        toast.info("Playback already in progress or initiated.");
        return;
    }
    cleanupSources();
    isCrossfadingRef.current = true;
    if (audioContext.state === 'suspended') audioContext.resume();

    const fadeDuration = crossfadeDuration > 0 ? crossfadeDuration : 0.01; // Ensure positive duration
    const startTime = audioContext.currentTime + 0.1;
    const durationTrack1 = buffer1Ref.current.duration / playbackRate;

    // Play track 1
    const s1Data = setupAndPlaySource(source1Ref, gain1Ref, buffer1Ref.current, startTime, 1, playbackRate);
    if (!s1Data) return;
    const { source: s1, gainNode: g1 } = s1Data;
    
    setStatus('Playing Track 1 (Crossfade setup)...');
    setIsPlaying(true);

    // Schedule fade out for track 1 and fade in for track 2
    const fadeOutStartTime = startTime + durationTrack1 - fadeDuration;
    if (fadeOutStartTime <= audioContext.currentTime) { // If track 1 is too short for full crossfade from end
        console.warn("Track 1 is too short for the selected crossfade duration from its end. Crossfading immediately or consider shorter fade.");
        // Potentially adjust fadeOutStartTime to audioContext.currentTime for an immediate crossfade if desired
    }

    g1.gain.setValueAtTime(1, Math.max(audioContext.currentTime, fadeOutStartTime)); // Start fade out at current value
    g1.gain.linearRampToValueAtTime(0, Math.max(audioContext.currentTime, fadeOutStartTime) + fadeDuration);

    s1.onended = () => {
        // This might fire early if track is shorter than fade calculation implies after stop
        if (source1Ref.current === s1) { // Only cleanup if it's this instance
            s1.disconnect();
            g1.disconnect();
            source1Ref.current = null;
            gain1Ref.current = null;
        }
    };
    // Ensure track1 stops after its fade is complete
    s1.stop(Math.max(audioContext.currentTime, fadeOutStartTime) + fadeDuration + 0.1);

    // Play track 2 (starts faded in)
    const s2Data = setupAndPlaySource(source2Ref, gain2Ref, buffer2Ref.current, Math.max(audioContext.currentTime, fadeOutStartTime), 0, playbackRate);
    if (!s2Data) return;
    const { source: s2, gainNode: g2 } = s2Data;

    g2.gain.setValueAtTime(0, Math.max(audioContext.currentTime, fadeOutStartTime)); // Start fade in at 0
    g2.gain.linearRampToValueAtTime(1, Math.max(audioContext.currentTime, fadeOutStartTime) + fadeDuration);
    
    setStatus(`Crossfading to Track 2 (for ${fadeDuration}s)...`);

    s2.onended = () => {
      if (source2Ref.current === s2) {
        setStatus('Track 2 finished (Crossfaded). Playback complete.');
        setIsPlaying(false);
        isCrossfadingRef.current = false;
      }
    };
    toast.info("Crossfade playback started.");
  };

  const handleStop = useCallback(() => {
    cleanupSources();
    setStatus('Playback stopped by user.');
    setIsPlaying(false);
    isCrossfadingRef.current = false;
    toast.info("Playback stopped.");
  }, [cleanupSources]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Web Audio API - Gapless & Crossfade Demo</h1>
      <p className="text-muted-foreground">
        This page demonstrates gapless playback of two pre-loaded audio segments using the Web Audio API.
        It does not integrate with Spotify/Apple Music players, as they handle playback internally.
      </p>
      <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure you have two short audio files (e.g., `sample_part1.mp3`, `sample_part2.mp3`) in the `public/audio/` directory of your project.</li>
          <li>Click "Load & Prepare Audio" to fetch and decode these files.</li>
          <li>Use the slider to set the desired crossfade duration (in seconds).</li>
          <li>Click "Play Gapless" to hear tracks play back-to-back without a gap.</li>
          <li>Click "Play Crossfade" to hear Track 1 fade out while Track 2 fades in.</li>
          <li>Click "Stop Playback" to halt audio.</li>
          <li>Use the "Playback Speed" slider to adjust the speed of the audio.</li>
        </ol>
        <p className="text-xs text-amber-600 mt-2">
            Note: Audio files are placeholders. You need to provide actual files at the specified paths for this demo to work.
            If you encounter fetch errors, check the file paths and ensure your dev server serves the `public` directory correctly.
        </p>
      </div>

      <canvas ref={canvasRef} width="600" height="100" className="w-full border rounded-md bg-gray-900"></canvas>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
            <Button onClick={handleLoadAndPrepare} disabled={isLoading || isPlaying || (!!buffer1Ref.current && !!buffer2Ref.current)}>
            {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            {buffer1Ref.current && buffer2Ref.current ? 'Audio Loaded' : 'Load & Prepare Audio'}
            </Button>
            <Button onClick={handleStop} disabled={!isPlaying && !(source1Ref.current || source2Ref.current)} variant="destructive">
                Stop Playback
            </Button>
        </div>
        <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Button onClick={handlePlayGapless} disabled={isLoading || isPlaying || !buffer1Ref.current || !buffer2Ref.current}>
            Play Gapless
            </Button>
            <div className="flex flex-col space-y-1 items-start">
                <Label htmlFor="crossfadeSlider">Crossfade: {crossfadeDuration}s</Label>
                <Slider 
                    id="crossfadeSlider"
                    min={0.5} max={10} step={0.5} 
                    value={[crossfadeDuration]} 
                    onValueChange={(value) => setCrossfadeDuration(value[0])} 
                    className="w-48"
                    disabled={isPlaying}
                />
            </div>
            <Button onClick={handlePlayCrossfade} disabled={isLoading || isPlaying || !buffer1Ref.current || !buffer2Ref.current}>
            Play Crossfade
            </Button>
        </div>
        <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Label htmlFor="playbackRateSlider" className="whitespace-nowrap">Playback Speed: {playbackRate.toFixed(1)}x</Label>
            <Slider
                id="playbackRateSlider"
                min={0.5} max={2} step={0.1}
                value={[playbackRate]}
                onValueChange={(value) => setPlaybackRate(value[0])}
                className="w-full"
                disabled={isPlaying && (source1Ref.current || source2Ref.current) ? false : false} // Allow changing while playing
            />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted min-h-[50px]">
        <p className="text-sm font-medium">Status: <span className="font-normal text-muted-foreground">{status}</span></p>
      </div>
      
    </div>
  );
};

export default GaplessDemoPage; 