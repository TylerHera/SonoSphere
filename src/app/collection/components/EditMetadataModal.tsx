'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { searchReleases, searchRecordings, getReleaseDetails } from '@/lib/api/musicbrainz';
import type { MusicBrainz } from '@/types/musicbrainz';
import type { VinylItem } from '@/types/collection'; // Assuming a VinylItem type exists
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

interface EditMetadataModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vinylItem: VinylItem | null; // The item to edit
  onSave: (updatedItem: Partial<VinylItem>) => Promise<void>; // Function to call when saving
}

const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  isOpen,
  onOpenChange,
  vinylItem,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<VinylItem>>({});
  const [mbSearchQuery, setMbSearchQuery] = useState("");
  const [mbReleaseResults, setMbReleaseResults] = useState<MusicBrainz.Release[]>([]);
  const [mbRecordingResults, setMbRecordingResults] = useState<MusicBrainz.Recording[]>([]);
  const [isLoadingMb, setIsLoadingMb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (vinylItem) {
      setFormData({
        title: vinylItem.title,
        artist_main: vinylItem.artist_main,
        release_title: vinylItem.release_title,
        year: vinylItem.year,
        genres: Array.isArray(vinylItem.genres) ? [...vinylItem.genres] : (typeof vinylItem.genres === 'string' ? vinylItem.genres.split(',').map(s => s.trim()) : []),
        // ... other fields from VinylItem like labels, formats, tracklist (if it becomes structured)
      });
      setMbSearchQuery(`${vinylItem.artist_main || ''} ${vinylItem.title || ''}`.trim());
    } else {
      setFormData({});
      setMbSearchQuery("");
    }
    setMbReleaseResults([]);
    setMbRecordingResults([]);
  }, [vinylItem, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "year") {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
    } else if (name === "genres") {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMusicBrainzSearch = async (type: 'release' | 'recording') => {
    if (!mbSearchQuery.trim()) {
      toast.info("Please enter a search query for MusicBrainz.");
      return;
    }
    setIsLoadingMb(true);
    setMbReleaseResults([]);
    setMbRecordingResults([]);
    try {
      if (type === 'release') {
        const response = await searchReleases(mbSearchQuery, 5);
        setMbReleaseResults(response.releases || []);
        if (!response.releases || response.releases.length === 0) toast.info("No releases found on MusicBrainz.")
      } else {
        // const response = await searchRecordings(mbSearchQuery, 5);
        // setMbRecordingResults(response.recordings || []);
        // if (!response.recordings || response.recordings.length === 0) toast.info("No recordings found on MusicBrainz.")
        toast.info("Recording search not fully implemented yet. Search for releases instead.");
      }
    } catch (error: any) {
      toast.error(`MusicBrainz search failed: ${error.message}`);
    } finally {
      setIsLoadingMb(false);
    }
  };

  const applyMusicBrainzRelease = async (release: MusicBrainz.Release) => {
    if (!release.id) return;
    setIsLoadingMb(true);
    try {
        // Fetch full release details to get tracklist, etc.
        const fullRelease = await getReleaseDetails(release.id, "recordings+artist-credits+label-info");
        
        setFormData(prev => ({
            ...prev,
            title: fullRelease.title || prev.title, // Usually this would be album title
            artist_main: fullRelease["artist-credit"]?.[0]?.artist.name || prev.artist_main,
            release_title: fullRelease.title || prev.release_title,
            year: fullRelease.date ? new Date(fullRelease.date).getFullYear() : prev.year,
            genres: fullRelease.genres?.map((g: any) => g.name) || prev.genres, // MB schema for genre might be complex
            // discogs_id: undefined, // Clear discogs_id if applying MB data?
            // musicbrainz_release_id: fullRelease.id, // Add this if you store MBIDs
            // labels: fullRelease["label-info"]?.map(li => ({ name: li.label.name, catno: li.catalog_number })) || prev.labels,
            // formats: fullRelease.media?.map(m => ({ name: m.format, description: m.title })) || prev.formats,
            // tracklist: fullRelease.media?.flatMap(m => m.tracks?.map(t => ({ position: t.number, title: t.title, duration: t.length ? (t.length / 1000) : undefined }))) || prev.tracklist
        }));
        toast.success(`Applied metadata from "${fullRelease.title}". Review and save.`);
        setMbReleaseResults([]); // Clear results after applying
    } catch (error: any) {
        toast.error(`Failed to apply MusicBrainz data: ${error.message}`);
    } finally {
        setIsLoadingMb(false);
    }
  };

  const handleSubmit = async () => {
    if (!vinylItem) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Metadata updated successfully!");
      onOpenChange(false); // Close modal on success
    } catch (error: any) {
      toast.error(`Failed to save metadata: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!vinylItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Metadata: {vinylItem.title}</DialogTitle>
          <DialogDescription>Manually edit fields or search MusicBrainz for metadata.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {/* Manual Edit Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Track/Album Title</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="artist_main">Main Artist</Label>
              <Input id="artist_main" name="artist_main" value={formData.artist_main || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="release_title">Release Title (if different)</Label>
              <Input id="release_title" name="release_title" value={formData.release_title || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" value={formData.year || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="genres">Genres (comma-separated)</Label>
              <Input id="genres" name="genres" value={(formData.genres || []).join(', ')} onChange={handleInputChange} />
            </div>
             {/* Add more fields like notes, custom_tags, etc. */}
             {/* For structured fields like labels, formats, tracklist, more complex UI is needed */}
          </div>

          {/* MusicBrainz Search Section */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">MusicBrainz Search</h3>
            <div className="flex gap-2 items-end">
              <div className="flex-grow">
                <Label htmlFor="mbSearch">Search Term (e.g., Artist Album)</Label>
                <Input id="mbSearch" value={mbSearchQuery} onChange={(e) => setMbSearchQuery(e.target.value)} placeholder="e.g., Nirvana Nevermind"/>
              </div>
              <Button onClick={() => handleMusicBrainzSearch('release')} disabled={isLoadingMb || !mbSearchQuery.trim()}>
                {isLoadingMb && <LoadingSpinner className="mr-2 h-4 w-4" />} Search Releases
              </Button>
              {/* <Button onClick={() => handleMusicBrainzSearch('recording')} disabled={isLoadingMb || !mbSearchQuery.trim()}>Search Recordings</Button> */}
            </div>

            {isLoadingMb && <LoadingSpinner className="mx-auto my-4 h-6 w-6" />} 

            {mbReleaseResults.length > 0 && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                <h4 className="text-sm font-medium">Found Releases:</h4>
                {mbReleaseResults.map(release => (
                  <div key={release.id} className="p-2 border-b hover:bg-muted/50 cursor-pointer" onClick={() => applyMusicBrainzRelease(release)}>
                    <p className="font-semibold">{release.title} {release.disambiguation ? `(${release.disambiguation})` : ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {release["artist-credit"]?.map(ac => ac.name).join(', ')} ({release.date?.substring(0,4)})
                    </p>
                    <p className="text-xs text-muted-foreground">{release.country} - {release.media?.map(m=>m.format).join('/')} - {release["track-count"]} tracks</p>
                  </div>
                ))}
              </div>
            )}
             {/* TODO: Display Recording Results if implemented */}
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSaving || isLoadingMb}>
            {isSaving && <LoadingSpinner className="mr-2 h-4 w-4" />} Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMetadataModal; 