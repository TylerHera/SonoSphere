'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { placeholderImage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Info } from 'lucide-react';

// Updated to match the more comprehensive definition from collection/page.tsx
interface VinylItemFromAPI {
  id: number;
  userId: string;
  discogs_id?: number | null;
  title: string;
  artist_main: string;
  artists_extra?: any | null; // Prisma Json? - Consider defining a more specific type if structure is known
  release_title?: string | null;
  year?: number | null;
  formats?: any | null; // Prisma Json? - Consider defining a more specific type
  labels?: any | null; // Prisma Json? - Consider defining a more specific type
  genres?: string[] | null;
  styles?: string[] | null;
  cover_url_small?: string | null;
  cover_url_large?: string | null;
  notes?: string | null;
  custom_tags?: string[] | null;
  added_at: string; // DateTime string
  updated_at: string; // DateTime string
  status?: 'OWNED' | 'WISHLIST'; // Added status
  folder?: string | null;
}

interface LocalAlbumCardProps {
  item: VinylItemFromAPI;
  onEdit: (item: VinylItemFromAPI) => void;
  onDelete: (itemId: number) => void;
  onTagClick?: (tag: string) => void;
  onFolderClick?: (folder: string) => void;
}

export const LocalAlbumCard: React.FC<LocalAlbumCardProps> = ({
  item,
  onEdit,
  onDelete,
  onTagClick,
  onFolderClick,
}) => {
  const displayImageUrl =
    item.cover_url_large || item.cover_url_small || placeholderImage(150, 150);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0 relative">
        {item.status === 'WISHLIST' && (
          <Badge
            variant="default"
            className="absolute top-2 right-2 z-10 bg-blue-600 text-white"
          >
            Wishlist
          </Badge>
        )}
        {item.status === 'OWNED' && (
          <Badge
            variant="default"
            className="absolute top-2 right-2 z-10 bg-green-600 text-white"
          >
            Owned
          </Badge>
        )}
        {/* Default to Owned if status is not set, or show nothing */}
        {!item.status && (
          <Badge variant="secondary" className="absolute top-2 right-2 z-10">
            Owned (default)
          </Badge>
        )}
        {/* Assuming a future local item detail page: /collection/item/[id] */}
        <Link href={`/collection/item/${item.id}`} passHref>
          <Image
            src={displayImageUrl}
            alt={`Cover for ${item.title} by ${item.artist_main}`}
            width={300}
            height={300}
            className="object-cover w-full aspect-square rounded-t-md"
            unoptimized={!item.cover_url_large && !item.cover_url_small} // Use unoptimized for placeholder
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <Link
          href={`/collection/item/${item.id}`}
          passHref
          className="hover:underline"
        >
          <CardTitle
            className="text-lg font-semibold leading-tight line-clamp-2"
            title={item.title}
          >
            {item.title}
          </CardTitle>
        </Link>
        <p
          className="text-sm text-muted-foreground line-clamp-1"
          title={item.artist_main}
        >
          {item.artist_main}
        </p>
        {item.year && (
          <p className="text-xs text-muted-foreground">{item.year}</p>
        )}
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}
        {item.custom_tags && item.custom_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.custom_tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs ${onTagClick ? 'cursor-pointer hover:bg-accent' : ''}`}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {item.folder && onFolderClick && (
          <div className="mt-1">
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-accent"
              onClick={() => onFolderClick(item.folder!)}
            >
              Folder: {item.folder}
            </Badge>
          </div>
        )}
        {item.folder && !onFolderClick && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">
              Folder: {item.folder}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 border-t flex justify-end space-x-1">
        <Button variant="ghost" size="icon" title="Details" asChild>
          <Link href={`/collection/item/${item.id}`}>
            <Info className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Edit"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
