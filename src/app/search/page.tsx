'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  AggregatedSearchResults,
  UnifiedSearchResult,
  SearchResultSource,
} from '@/types/search';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { placeholderImage } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function SearchResultItem({ item }: { item: UnifiedSearchResult }) {
  const getSourceBadgeVariant = (source: SearchResultSource) => {
    switch (source) {
      case 'spotify':
        return 'default';
      case 'appleMusic':
        return 'destructive';
      case 'discogs':
        return 'secondary';
      case 'youtube':
        return 'outline';
      default:
        return 'info';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0 relative h-40">
        <Image
          src={item.imageUrl || placeholderImage(150, 150)}
          alt={`Cover for ${item.title}`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle
          className="text-lg leading-tight truncate"
          title={item.title}
        >
          {item.title}
        </CardTitle>
        {item.artist && (
          <CardDescription className="truncate" title={item.artist}>
            {item.artist}
          </CardDescription>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Badge
            variant={getSourceBadgeVariant(item.source)}
            className="capitalize text-xs"
          >
            {item.source}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {item.type}
          </Badge>
          {item.year && (
            <Badge variant="outline" className="text-xs">
              {item.year}
            </Badge>
          )}
        </div>
      </CardContent>
      {item.url && item.url !== '#' && (
        <CardFooter className="p-4 pt-0">
          <Button variant="outline" size="sm" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              View on {item.source}
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function UnifiedSearchComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] =
    useState<AggregatedSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResults = useCallback(async (currentQuery: string) => {
    if (!currentQuery.trim()) {
      setSearchResults(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Add source selection UI later
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(currentQuery.trim())}`,
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.message || `Search failed with status: ${response.status}`,
        );
      }
      const data: AggregatedSearchResults = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred during search.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If there's an initial query from URL, fetch results
    if (initialQuery) {
      fetchSearchResults(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]); // Only re-run if initialQuery from URL changes (e.g. navigation)

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newPath = `${pathname}?q=${encodeURIComponent(query.trim())}`;
    router.push(newPath); // This will update searchParams and trigger useEffect above if initialQuery changes
    // Or call fetchSearchResults directly if you don't want URL to manage state for subsequent searches
    // fetchSearchResults(query);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Unified Search</h1>
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-2 mb-8"
      >
        <Input
          type="search"
          placeholder="Search Spotify, Apple Music, Discogs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
          aria-label="Search query"
        />
        <Button type="submit" disabled={isLoading} aria-label="Submit search">
          {isLoading ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResults?.errors &&
        Object.keys(searchResults.errors).length > 0 && (
          <Alert variant="warning" className="mb-6">
            <AlertTitle>Source Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {Object.entries(searchResults.errors).map(
                  ([source, errMsg]) => (
                    <li key={source}>
                      <strong className="capitalize">{source}:</strong> {errMsg}
                    </li>
                  ),
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

      {isLoading && !searchResults && (
        <LoadingSpinner className="mx-auto h-12 w-12 mt-10" />
      )}

      {searchResults && searchResults.results.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground mt-10">
          No results found for &quot;{searchResults.query}&quot;.
        </p>
      )}

      {searchResults && searchResults.results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {searchResults.results.map((item) => (
            <SearchResultItem key={`${item.source}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// Wrap with Suspense because useSearchParams() is used.
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <LoadingSpinner className="mx-auto h-12 w-12 mt-10" />
        </div>
      }
    >
      <UnifiedSearchComponent />
    </Suspense>
  );
}
