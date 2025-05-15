'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { scrobbleTrack as lastfmScrobbleTrack } from '@/lib/api/lastfm';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ManualScrobbleFormProps {
  lastfmSessionKey: string | null;
  onScrobbleSubmitted?: () => void; // Callback to refresh scrobble list
}

export function ManualScrobbleForm({
  lastfmSessionKey,
  onScrobbleSubmitted,
}: ManualScrobbleFormProps) {
  const [artist, setArtist] = useState('');
  const [track, setTrack] = useState('');
  const [album, setAlbum] = useState('');
  const [timestamp, setTimestamp] = useState<number>(
    Math.floor(Date.now() / 1000),
  ); // Unix timestamp in seconds
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [customTime, setCustomTime] = useState<string>(
    new Date().toTimeString().slice(0, 5),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastfmSessionKey) {
      toast.error(
        'Last.fm session key not found. Please reconnect in settings.',
      );
      return;
    }
    if (!artist || !track) {
      toast.error('Artist and Track are required.');
      return;
    }

    setIsSubmitting(true);

    // Combine date and time for timestamp
    const dateTimeString = `${customDate}T${customTime}:00`;
    const selectedTimestamp = Math.floor(
      new Date(dateTimeString).getTime() / 1000,
    );

    if (isNaN(selectedTimestamp)) {
      toast.error('Invalid date or time provided.');
      setIsSubmitting(false);
      return;
    }

    const response = await lastfmScrobbleTrack(
      artist,
      track,
      selectedTimestamp,
      lastfmSessionKey,
      album || undefined, // Send undefined if empty, not empty string
      // albumArtist and duration are optional in lastfm.ts and can be omitted
    );

    if ('error' in response) {
      toast.error(`Failed to submit scrobble: ${response.message}`);
    } else if (response.scrobbles['@attr'].accepted > 0) {
      toast.success(`Scrobbled: ${track} by ${artist}`);
      setArtist('');
      setTrack('');
      setAlbum('');
      if (onScrobbleSubmitted) {
        onScrobbleSubmitted();
      }
      setIsOpen(false); // Close dialog on success
    } else if (response.scrobbles['@attr'].ignored > 0) {
      const ignoredReason =
        response.scrobbles.scrobble[0]?.ignoredmessage?.['#text'] ||
        'Track ignored by Last.fm';
      toast.warning(`Scrobble ignored: ${ignoredReason}`);
    } else {
      toast.warning('Scrobble submitted, but Last.fm response unclear.');
    }
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsOpen(open);
    if (!open) {
      // Reset form on close if not submitting
      setArtist('');
      setTrack('');
      setAlbum('');
      setCustomDate(new Date().toISOString().split('T')[0]);
      setCustomTime(new Date().toTimeString().slice(0, 5));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Manual Scrobble</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Manual Scrobble</DialogTitle>
          <DialogDescription>
            Manually add a track you listened to. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="artist" className="text-right">
                Artist *
              </Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="track" className="text-right">
                Track *
              </Label>
              <Input
                id="track"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="album" className="text-right">
                Album
              </Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Scrobble'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
