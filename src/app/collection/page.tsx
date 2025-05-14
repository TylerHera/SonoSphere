import { Suspense } from 'react';
import CollectionSearchForm from './components/CollectionSearchForm';
import CollectionGrid from './components/CollectionGrid';
import { searchReleases, DiscogsSearchResult } from '@/lib/api/discogs';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface CollectionPageProps {
  searchParams?: {
    query?: string;
    page?: string;
    // Add other potential search params from Discogs API if needed
  };
}

async function SearchResults({ query, currentPage }: { query: string; currentPage: number }) {
  try {
    const searchData: DiscogsSearchResult = await searchReleases({ query: query, page: currentPage, per_page: 30 });
    return (
      <>
        <CollectionGrid releases={searchData.results} />
        {searchData.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <PaginationComponent 
              currentPage={searchData.pagination.page}
              totalPages={searchData.pagination.pages}
              baseUrl="/collection"
              query={query}
            />
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Page {searchData.pagination.page} of {searchData.pagination.pages} ({searchData.pagination.items} results)
        </p>
      </>
    );
  } catch (error) {
    console.error("Failed to fetch Discogs search results:", error);
    return <p className="text-center text-destructive">Failed to load search results. Please try again.</p>;
  }
}

function PaginationComponent({
  currentPage,
  totalPages,
  baseUrl,
  query
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
  const maxPagesToShow = 5; // Show 2 pages before and 2 after current, plus current
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
            <PaginationLink href={createPageURL(page)} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages -1 && <PaginationEllipsis />} 
            <PaginationItem>
              <PaginationLink href={createPageURL(totalPages)}>{totalPages}</PaginationLink>
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


export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Discogs Collection Search</h1>
      <CollectionSearchForm />
      {query ? (
        <Suspense fallback={<p className="text-center">Loading search results...</p>}>
          <SearchResults query={query} currentPage={currentPage} />
        </Suspense>
      ) : (
        <p className="text-center text-muted-foreground">Search for releases on Discogs to see results.</p>
      )}
    </div>
  );
} 