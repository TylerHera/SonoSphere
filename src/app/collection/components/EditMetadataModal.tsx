'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchReleases, getReleaseDetails } from '@/lib/api/musicbrainz';
import type { MusicBrainz } from '@/types/musicbrainz';
import type { VinylItem } from '@/types/collection'; // Assuming a VinylItem type exists
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

interface EditMetadataModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vinylItem: VinylItem | null; // Can be null if creating new
  onSave: (updatedItem: Partial<VinylItem>) => void;
}

const initialFormData: Partial<VinylItem> = {
  title: '',
  artist_main: '',
  release_title: '',
  year: undefined,
  status: 'OWNED',
  notes: '',
  folder: '',
  genres: [],
};

export function EditMetadataModal({
  isOpen,
  onOpenChange,
  vinylItem,
  onSave,
}: EditMetadataModalProps) {
  const [formData, setFormData] = useState<Partial<VinylItem>>(() =>
    vinylItem
      ? {
          title: vinylItem.title || '',
          artist_main: vinylItem.artist_main || '',
          release_title: vinylItem.release_title || '',
          year: vinylItem.year || undefined,
          status: vinylItem.status || 'OWNED',
          notes: vinylItem.notes || '',
          folder: vinylItem.folder || '',
          genres: vinylItem.genres ? [...vinylItem.genres] : [],
        }
      : initialFormData,
  );
  const [mbSearchQuery, setMbSearchQuery] = useState('');
  const [mbReleaseResults, setMbReleaseResults] = useState<
    MusicBrainz.Release[]
  >([]);
  const [isSearchingMb, setIsSearchingMb] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vinylItem) {
        setFormData({
          title: vinylItem.title || '',
          artist_main: vinylItem.artist_main || '',
          release_title: vinylItem.release_title || '',
          year: vinylItem.year || undefined,
          status: vinylItem.status || 'OWNED',
          notes: vinylItem.notes || '',
          folder: vinylItem.folder || '',
          genres: vinylItem.genres ? [...vinylItem.genres] : [],
          // ... other fields from VinylItem like labels, formats, tracklist (if it becomes structured)
        });
        setMbSearchQuery(
          `${vinylItem.artist_main || ''} ${vinylItem.title || ''}`.trim(),
        );
        setMbReleaseResults([]);
      } else {
        // Reset form for creating a new item
        setFormData(initialFormData);
        setMbSearchQuery('');
        setMbReleaseResults([]);
      }
    }
  }, [isOpen, vinylItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Assuming genres are input as comma-separated string for now
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      genres: value.split(',').map((s) => s.trim()),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleMusicBrainzSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!mbSearchQuery.trim()) {
      toast.info('Please enter a search query for MusicBrainz.');
      return;
    }
    setIsSearchingMb(true);
    try {
      const results = await searchReleases(mbSearchQuery, 10);
      setMbReleaseResults(results.releases || []);
      if (!results.releases || results.releases.length === 0) {
        toast.info('No releases found on MusicBrainz for your query.');
      }
    } catch (error: any) {
      console.error('MusicBrainz search error:', error);
      toast.error(`MusicBrainz search failed: ${error.message}`);
      setMbReleaseResults([]);
    } finally {
      setIsSearchingMb(false);
    }
  };

  const handleApplyMusicBrainzData = async (mbid: MusicBrainz.MBID) => {
    setIsFetchingDetails(true);
    try {
      const mbRelease = await getReleaseDetails(mbid);
      setFormData((prev) => ({
        ...prev,
        title: mbRelease.title || prev.title,
        artist_main: mbRelease['artist-credit']?.[0]?.name || prev.artist_main,
        release_title: mbRelease.title || prev.release_title, // Often same as overall title for a release
        year: mbRelease.date
          ? parseInt(mbRelease.date.substring(0, 4), 10)
          : prev.year,
        musicbrainz_release_id: mbRelease.id,
        // Genres are not directly on MB Release, they are often on Release Group or via tags.
        // For simplicity, we are not auto-populating genres from here.
        // User can add them manually or this could be a future enhancement to fetch from release-group.
      }));
      toast.success('Applied MusicBrainz data for ' + mbRelease.title);
    } catch (error: any) {
      console.error('Failed to fetch or apply MusicBrainz details:', error);
      toast.error(
        `Failed to apply MusicBrainz data: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {vinylItem ? 'Edit Metadata' : 'Add New Vinyl'}
          </DialogTitle>
          <DialogDescription>
            {vinylItem
              ? `Editing details for ${vinylItem.title}`
              : 'Manually add a new record to your collection.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="artist_main">Artist</Label>
              <Input
                id="artist_main"
                name="artist_main"
                value={formData.artist_main || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {/* ... other form fields ... */}
          <div>
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              name="genres"
              value={
                Array.isArray(formData.genres) ? formData.genres.join(', ') : ''
              }
              onChange={handleGenreChange}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSearchingMb || isFetchingDetails}>
              {isFetchingDetails ? <LoadingSpinner /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>

        {/* MusicBrainz Search Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-2">
            Search MusicBrainz & Apply Data
          </h3>
          <form
            onSubmit={handleMusicBrainzSearch}
            className="flex items-center gap-2 mb-4"
          >
            <Input
              type="text"
              value={mbSearchQuery}
              onChange={(e) => setMbSearchQuery(e.target.value)}
              placeholder="Search MusicBrainz (e.g., Artist Album)"
              className="flex-grow"
            />
            <Button type="submit" variant="secondary" disabled={isSearchingMb}>
              {isSearchingMb ? <LoadingSpinner /> : 'Search'}
            </Button>
          </form>
          {isFetchingDetails && <LoadingSpinner className="my-2 mx-auto" />}
          {mbReleaseResults.length > 0 && (
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <ul className="space-y-2">
                {mbReleaseResults.map((mbRelease) => (
                  <li
                    key={mbRelease.id}
                    className="text-sm p-2 border-b last:border-b-0"
                  >
                    <div>
                      <strong>{mbRelease.title}</strong> by{' '}
                      {mbRelease['artist-credit']
                        ?.map((ac) => ac.name)
                        .join(', ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mbRelease.date} ({mbRelease.country}) - Status:{' '}
                      {mbRelease.status}
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 h-auto mt-1"
                      onClick={() => handleApplyMusicBrainzData(mbRelease.id)}
                      disabled={isFetchingDetails}
                    >
                      Apply this data
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
