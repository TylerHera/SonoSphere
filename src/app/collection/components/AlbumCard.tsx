'use client'; // Or remove if no client-side interactivity needed for the card itself

import Image from 'next/image';
import Link from 'next/link';
import { DiscogsRelease } from '@/lib/api/discogs'; // Import the type
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { placeholderImage } from '@/lib/utils'; // Assuming a placeholder utility

interface AlbumCardProps {
  release: DiscogsRelease;
}

export default function AlbumCard({ release }: AlbumCardProps) {
  const displayArtists = release.artists?.map(artist => artist.name).join(', ') || release.artists_sort || 'Unknown Artist';

  return (
    <Link href={`/collection/${release.id}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
        <Card className="h-full flex flex-col">
          <CardHeader className="p-0 relative aspect-square overflow-hidden">
            <Image
              src={release.cover_image || release.thumb || placeholderImage(300,300) }
              alt={`Cover for ${release.title} by ${displayArtists}`}
              width={300} // Or desired width for consistency
              height={300} // Or desired height
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              unoptimized={release.cover_image?.includes('discogs.com') || release.thumb?.includes('discogs.com')} // Avoid optimizing Discogs images
            />
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg font-semibold leading-tight truncate" title={release.title}>
              {release.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground truncate" title={displayArtists}>
              {displayArtists}
            </CardDescription>
          </CardContent>
          {release.year && (
            <CardFooter className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">{release.year}</p>
            </CardFooter>
          )}
        </Card>
      </a>
    </Link>
  );
} 