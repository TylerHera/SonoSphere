'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react'; // For tag delete icon
import { Badge } from '@/components/ui/badge'; // For displaying tags as chips
// import { toast } from 'sonner';

// Matches the VinylItem structure from the backend/prisma and collection page
interface VinylItemFromAPI {
  id: number;
  userId: string;
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
  added_at: string; 
  updated_at: string; 
  status?: 'OWNED' | 'WISHLIST';
  folder?: string | null;
}

// DTO for updating - backend might expect a subset of fields (UpdateVinylItemDto)
// For simplicity, the form will handle all editable fields from VinylItemFromAPI
// Ensure the backend DTO (UpdateVinylItemDto) allows these fields.
interface UpdateVinylItemPayload extends Partial<Omit<VinylItemFromAPI, 'id' | 'userId' | 'added_at' | 'updated_at'>> {
    folder?: string | null;
}

interface EditVinylItemFormProps {
  accessToken: string;
  item: VinylItemFromAPI;
  onFormSubmit: () => void;
  onCancel: () => void;
  isOpen?: boolean;
}

export function EditVinylItemForm({ accessToken, item, onFormSubmit, onCancel, isOpen }: EditVinylItemFormProps) {
  const [formData, setFormData] = useState<UpdateVinylItemPayload>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (item) {
      // Pre-fill form data from the item, excluding non-editable fields
      const { id, userId, added_at, updated_at, ...editableData } = item;
      setFormData({
        ...editableData,
        status: item.status || 'OWNED',
        custom_tags: item.custom_tags || [], // Ensure custom_tags is initialized as an array
        folder: item.folder || '',
        // Ensure array fields are handled correctly for controlled input (e.g. join)
        // If the form directly binds to item fields that are arrays, this might not be needed here
        // but for the initial state, we're good.
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value),
    }));
  };
  
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(s => s.trim()).filter(s => s !== ''),
    }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (currentTagInput.trim() !== '' && !formData.custom_tags?.includes(currentTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        custom_tags: [...(prev.custom_tags || []), currentTagInput.trim()],
      }));
    }
    setCurrentTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      custom_tags: prev.custom_tags?.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleStatusChange = (value: 'OWNED' | 'WISHLIST') => {
    setFormData(prev => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiBaseUrl || !accessToken || !item?.id) {
      // toast.error("API config, token, or item ID is missing.");
      console.error("API config, token, or item ID is missing.");
      return;
    }
     if (!formData.title || !formData.artist_main) {
      // toast.error("Title and Main Artist are required.");
      console.error("Title and Main Artist are required.");
      return;
    }

    setIsSubmitting(true);
    
    const payload: UpdateVinylItemPayload = {
        ...formData,
        year: formData.year ? Number(formData.year) : null,
        discogs_id: formData.discogs_id ? Number(formData.discogs_id) : null,
        status: formData.status || 'OWNED',
        folder: formData.folder?.trim() === '' ? null : formData.folder?.trim(),
    };

    try {
      const response = await fetch(`${apiBaseUrl}/vinyl-items/${item.id}`, {
        method: 'PATCH', // Or PUT, depending on backend controller (Patch used in controller)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update vinyl item");
      }
      // toast.success("Vinyl item updated successfully!");
      if (onFormSubmit) onFormSubmit();
    } catch (error: any) {
      console.error("Error updating vinyl item:", error);
      // toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null; // Or a loading/error state if item is not passed when isOpen is true

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vinyl Item</DialogTitle>
          <DialogDescription>
            Update the details for this vinyl record. * required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
          <div>
            <Label htmlFor="edit-title">Title *</Label>
            <Input id="edit-title" name="title" value={formData.title || ''} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-artist_main">Main Artist *</Label>
            <Input id="edit-artist_main" name="artist_main" value={formData.artist_main || ''} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-status">Status *</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNED">Owned</SelectItem>
                <SelectItem value="WISHLIST">Wishlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-folder">Folder</Label>
            <Input id="edit-folder" name="folder" value={formData.folder || ''} onChange={handleChange} placeholder="e.g., Jazz Vocals, 70s Rock" />
          </div>
          <div>
            <Label htmlFor="edit-year">Year</Label>
            <Input id="edit-year" name="year" type="number" value={formData.year ?? ''} onChange={handleNumberChange} />
          </div>
          <div>
            <Label htmlFor="edit-release_title">Release Title</Label>
            <Input id="edit-release_title" name="release_title" value={formData.release_title || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="edit-genres">Genres (comma-separated)</Label>
            <Input id="edit-genres" name="genres" value={formData.genres?.join(', ') || ''} onChange={handleArrayChange} />
          </div>
          <div>
            <Label htmlFor="edit-styles">Styles (comma-separated)</Label>
            <Input id="edit-styles" name="styles" value={formData.styles?.join(', ') || ''} onChange={handleArrayChange} />
          </div>
          <div>
            <Label htmlFor="edit-custom_tags">Custom Tags</Label>
            <div className="flex items-center gap-2 mb-2">
                <Input 
                    id="edit_custom_tags_input" 
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
                <Button type="button" variant="outline" onClick={handleAddTag}>Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {formData.custom_tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
            <Label htmlFor="edit-cover_url_large">Cover URL (Large)</Label>
            <Input id="edit-cover_url_large" name="cover_url_large" value={formData.cover_url_large || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>
          {/* Ensure all relevant fields are present and match UpdateVinylItemDto on backend */}
          <DialogFooter className="mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 