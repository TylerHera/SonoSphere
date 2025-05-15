'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For notes
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Select
import { X } from 'lucide-react'; // For tag delete icon
// import { toast } from 'sonner'; // Assuming setup by user
import { Badge } from '@/components/ui/badge';

// DTO for creating a vinyl item - mirrors backend CreateVinylItemDto
// but without userId as that's handled by the backend from the token.
interface CreateVinylItemPayload {
  discogs_id?: number | null;
  title: string;
  artist_main: string;
  artists_extra?: any | null;
  release_title?: string | null;
  year?: number | null;
  formats?: any | null;
  labels?: any | null;
  genres?: string[] | null;
  styles?: string[] | null;
  cover_url_small?: string | null;
  cover_url_large?: string | null;
  notes?: string | null;
  custom_tags?: string[] | null;
  status?: 'OWNED' | 'WISHLIST'; // Added status
  folder?: string | null; // Added folder
}

interface AddVinylItemFormProps {
  accessToken: string;
  onFormSubmit: () => void;
  onCancel: () => void; // To close the dialog from parent
  isOpen?: boolean; // Controlled by parent
}

export function AddVinylItemForm({
  accessToken,
  onFormSubmit,
  onCancel,
  isOpen,
}: AddVinylItemFormProps) {
  const [formData, setFormData] = useState<CreateVinylItemPayload>({
    title: '',
    artist_main: '',
    status: 'OWNED', // Default to OWNED
    custom_tags: [], // Initialize as empty array for chip input
    folder: '', // Initialize folder
    // Initialize other fields as needed or leave them to be set by user input
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : Number(value),
    }));
  };

  // For string arrays like genres, styles, custom_tags (comma-separated input)
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== ''),
    }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (
      currentTagInput.trim() !== '' &&
      !formData.custom_tags?.includes(currentTagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        custom_tags: [...(prev.custom_tags || []), currentTagInput.trim()],
      }));
    }
    setCurrentTagInput(''); // Clear input field
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      custom_tags: prev.custom_tags?.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleStatusChange = (value: 'OWNED' | 'WISHLIST') => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiBaseUrl || !accessToken) {
      // toast.error("API configuration or authentication token is missing.");
      console.error('API configuration or authentication token is missing.');
      return;
    }
    if (!formData.title || !formData.artist_main) {
      // toast.error("Title and Main Artist are required.");
      console.error('Title and Main Artist are required.');
      return;
    }

    setIsSubmitting(true);

    const payload: CreateVinylItemPayload = {
      ...formData,
      // Ensure numeric fields are numbers or null
      year: formData.year ? Number(formData.year) : null,
      discogs_id: formData.discogs_id ? Number(formData.discogs_id) : null,
      status: formData.status || 'OWNED', // Ensure status is set
      folder: formData.folder?.trim() === '' ? null : formData.folder?.trim(), // Ensure empty string becomes null
      // JSON fields would need proper parsing if entered as string, for now assume they are handled or simple strings
    };

    try {
      const response = await fetch(`${apiBaseUrl}/vinyl-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add vinyl item');
      }
      // toast.success("Vinyl item added successfully!");
      setFormData({
        title: '',
        artist_main: '',
        status: 'OWNED',
        custom_tags: [],
        folder: '',
      }); // Reset form including folder
      if (onFormSubmit) onFormSubmit();
    } catch (error: any) {
      console.error('Error adding vinyl item:', error);
      // toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vinyl to Collection</DialogTitle>
          <DialogDescription>
            Fill in the details for the new vinyl record. * required.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3"
        >
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="artist_main">Main Artist *</Label>
            <Input
              id="artist_main"
              name="artist_main"
              value={formData.artist_main}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNED">Owned</SelectItem>
                <SelectItem value="WISHLIST">Wishlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="folder">Folder</Label>
            <Input
              id="folder"
              name="folder"
              value={formData.folder || ''}
              onChange={handleChange}
              placeholder="e.g., Jazz Vocals, 70s Rock"
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year || ''}
              onChange={handleNumberChange}
            />
          </div>
          <div>
            <Label htmlFor="release_title">
              Release Title (if different from main title)
            </Label>
            <Input
              id="release_title"
              name="release_title"
              value={formData.release_title || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              name="genres"
              value={formData.genres?.join(', ') || ''}
              onChange={handleArrayChange}
            />
          </div>
          <div>
            <Label htmlFor="styles">Styles (comma-separated)</Label>
            <Input
              id="styles"
              name="styles"
              value={formData.styles?.join(', ') || ''}
              onChange={handleArrayChange}
            />
          </div>
          <div>
            <Label htmlFor="custom_tags">Custom Tags</Label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                id="custom_tags_input"
                placeholder="Add a tag"
                value={currentTagInput}
                onChange={handleTagInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.custom_tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full hover:bg-destructive/80 p-0.5"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="cover_url_large">Cover URL (Large)</Label>
            <Input
              id="cover_url_large"
              name="cover_url_large"
              value={formData.cover_url_large || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
            />
          </div>
          {/* Add more fields as needed: artists_extra, formats, labels, custom_tags, discogs_id etc. */}
          {/* For JSON fields like artists_extra, formats, labels, a more complex input strategy might be needed */}
          {/* e.g., repeatable field groups or a JSON editor, or accept simple comma separated strings and parse in backend */}
          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add to Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
