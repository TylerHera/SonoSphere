'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { placeholderImage } from '@/lib/utils';
import { DiscogsRelease } from '@/lib/api/discogs'; // Assuming this type is correctly defined
// import { toast } from 'sonner'; // User will set up sonner
import { useAuth } from '@/components/providers/AuthProvider';
import { CheckCircle, PlusCircle, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DiscogsImportCardProps {
  release: DiscogsRelease;
  accessToken: string | null; // Passed from server component, might be null initially
}

// Matches CreateVinylItemDto (or the relevant parts for import)
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
  // notes and custom_tags will be empty on import from Discogs initially
}

export default function DiscogsImportCard({ release, accessToken: initialAccessToken }: DiscogsImportCardProps) {
  const { session } = useAuth(); // Get fresh session for token client-side
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAccessToken = session?.access_token || initialAccessToken;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const mapDiscogsToVinylItem = (discogsRelease: DiscogsRelease): CreateVinylItemPayload => {
    // Basic mapping, can be expanded
    let mainArtist = 'Unknown Artist';
    if (discogsRelease.artists && discogsRelease.artists.length > 0) {
      mainArtist = discogsRelease.artists[0].name;
    } else if ((discogsRelease as any).artist) { // Fallback for older/different structures if any
        mainArtist = (discogsRelease as any).artist;
    }

    return {
      discogs_id: discogsRelease.id,
      title: discogsRelease.title || 'Untitled',
      artist_main: mainArtist,
      // artists_extra could be mapped from discogsRelease.artists if needed
      release_title: discogsRelease.title, // Often same as title for albums
      year: discogsRelease.year ? Number(discogsRelease.year) : undefined,
      genres: discogsRelease.genres || [], // Corrected from genre
      styles: discogsRelease.styles || [], // Corrected from style
      cover_url_small: discogsRelease.thumb || undefined,
      cover_url_large: discogsRelease.cover_image || undefined,
      formats: discogsRelease.formats ? discogsRelease.formats.map(f => ({ name: f.name, qty: f.qty, text: f.text, descriptions: f.descriptions })) : undefined,
      labels: discogsRelease.labels ? discogsRelease.labels.map(l => ({ name: l.name, catno: l.catno })) : undefined, // Corrected from label
    };
  };

  const handleImport = async () => {
    if (!currentAccessToken || !apiBaseUrl) {
      // toast.error("Cannot import: Missing API configuration or authentication.");
      setError("Cannot import: Missing API configuration or authentication.");
      return;
    }
    if (!release) return;

    setIsImporting(true);
    setError(null);
    const payload = mapDiscogsToVinylItem(release);

    try {
      const response = await fetch(`${apiBaseUrl}/vinyl-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific error for already existing discogs_id (unique constraint)
        if (response.status === 409 || (errorData.message && errorData.message.toLowerCase().includes('unique constraint failed'))) {
            // toast.info(`"${release.title}" might already be in your collection.`);
            setIsImported(true); // Treat as imported if it already exists based on discogs_id
            setError('Item already in collection (Discogs ID match).');
        } else {
            throw new Error(errorData.message || "Failed to import vinyl item");
        }
      } else {
        // toast.success(`Imported "${release.title}" to your collection!`);
        setIsImported(true);
      }
    } catch (e: any) {
      console.error("Error importing vinyl item:", e);
      // toast.error(e.message || "An unexpected error occurred during import.");
      setError(e.message || "Failed to import.");
    } finally {
      setIsImporting(false);
    }
  };

  const displayImageUrl = release.cover_image || release.thumb || placeholderImage(150,150);

  return (
    <Card className="flex flex-col h-full relative">
      {isImported && (
        <div className="absolute inset-0 bg-green-900 bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-md">
          <CheckCircle className="h-12 w-12 text-white mb-2" />
          <p className="text-white text-sm font-semibold text-center px-2">
            {error && error.startsWith('Item already') ? 'Already in Collection' : 'Imported!'}
          </p>
          {error && error.startsWith('Item already') && <p className="text-xs text-gray-200">(Discogs ID match)</p>}
        </div>
      )}
       {error && !isImported && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-md">
          <AlertCircle className="h-12 w-12 text-white mb-2" />
          <p className="text-white text-sm font-semibold text-center px-2">Import Failed</p>
          <p className="text-xs text-gray-200 px-2 text-center">{error}</p>
        </div>
      )}
      <CardHeader className="p-0 relative">
        <Image
          src={displayImageUrl}
          alt={`Cover for ${release.title}`}
          width={300}
          height={300}
          className="object-cover w-full aspect-square rounded-t-md"
          unoptimized={!release.cover_image && !release.thumb} 
        />
      </CardHeader>
      <CardContent className="flex-grow p-3 space-y-1">
        <CardTitle className="text-base font-semibold leading-tight line-clamp-2" title={release.title}>
          {release.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-1" title={release.artists?.map(a => a.name).join(', ') || (release as any).artist}>
          {release.artists?.map(a => a.name).join(', ') || (release as any).artist || 'Unknown Artist'}
        </p>
        <p className="text-xs text-muted-foreground">
          {release.year || 'N/A'} {release.labels && release.labels.length > 0 ? `` : ''}
        </p>
        {release.labels && release.labels.length > 0 && 
            <p className="text-xs text-muted-foreground line-clamp-1" title={release.labels.map(l => l.name).join(', ')}>{release.labels.map(l => l.name).join(', ')}</p>}
      </CardContent>
      <CardFooter className="p-2 border-t flex justify-between items-center">
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImport} 
            disabled={isImporting || isImported}
            className="w-full"
        >
          {isImporting ? (
            'Importing...'
          ) : isImported ? (
            <><CheckCircle className="h-4 w-4 mr-2" /> Imported</>
          ) : (
            <><PlusCircle className="h-4 w-4 mr-2" /> Add to My Collection</>
          )}
        </Button>
        {release.uri && (
            <Button variant="ghost" size="icon" asChild title="View on Discogs">
                <Link href={`https://discogs.com${release.uri}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
} 