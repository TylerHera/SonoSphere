// src/app/collection/import/page.tsx
import React, { Suspense } from 'react';
import CollectionSearchForm from '../components/CollectionSearchForm'; // We'll reuse this
import {
  searchReleases,
  DiscogsSearchResult,
  DiscogsRelease,
} from '@/lib/api/discogs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import DiscogsImportCard from './DiscogsImportCard'; // To be created
import { createClient } from '@/lib/supabase/client'; // For getting access token client-side in DiscogsImportCard

interface ImportPageProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}

async function DiscogsSearchResults({
  query,
  currentPage,
  accessToken,
}: {
  query: string;
  currentPage: number;
  accessToken: string | null;
}) {
  try {
    const searchData: DiscogsSearchResult = await searchReleases({
      query: query,
      page: currentPage,
      per_page: 10,
    }); // smaller per_page for import UI

    if (!searchData.results || searchData.results.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          No results found on Discogs for &quot;{query}&quot;.
        </p>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {searchData.results.map((release) => (
            <DiscogsImportCard
              key={release.id}
              release={release}
              accessToken={accessToken}
            />
          ))}
        </div>
        {searchData.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <PaginationComponent
              currentPage={searchData.pagination.page}
              totalPages={searchData.pagination.pages}
              baseUrl="/collection/import"
              query={query}
            />
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Page {searchData.pagination.page} of {searchData.pagination.pages} (
          {searchData.pagination.items} results on Discogs)
        </p>
      </>
    );
  } catch (error) {
    console.error('Failed to fetch Discogs search results for import:', error);
    return (
      <p className="text-center text-destructive">
        Failed to load Discogs search results. Please ensure your Discogs API
        keys are set up and try again.
      </p>
    );
  }
}

function PaginationComponent({
  currentPage,
  totalPages,
  baseUrl,
  query,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  query?: string;
}) {
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    params.set('page', pageNumber.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= 3) {
      endPage = maxPagesToShow;
    } else if (currentPage + 2 >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={createPageURL(currentPage - 1)} />
          </PaginationItem>
        )}
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={createPageURL(1)}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && <PaginationEllipsis />}
          </>
        )}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageURL(page)}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink href={createPageURL(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={createPageURL(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

// This page will use client-side Supabase to get the token for import actions.
// The search results themselves are fetched server-side.
export default async function ImportDiscogsPage({
  searchParams,
}: ImportPageProps) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // accessToken will be null here on server. Client component (DiscogsImportCard) will get it.
  // This is a simplification; ideally, the action of importing would be a server action
  // or an API route that is called from a client component which has the token.
  // Passing null for now, the client component will handle fetching its own token if needed.
  const accessToken = null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import from Discogs</h1>
        <p className="text-muted-foreground">
          Search for releases on Discogs and add them to your local SonoSphere
          collection.
        </p>
      </div>
      <CollectionSearchForm searchPath="/collection/import" />
      {query ? (
        <Suspense
          fallback={
            <p className="text-center mt-6">
              Loading Discogs search results...
            </p>
          }
        >
          <DiscogsSearchResults
            query={query}
            currentPage={currentPage}
            accessToken={accessToken}
          />
        </Suspense>
      ) : (
        <p className="text-center text-muted-foreground mt-6">
          Search for releases on Discogs to see results.
        </p>
      )}
    </div>
  );
}
