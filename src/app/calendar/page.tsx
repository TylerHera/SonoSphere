import { Suspense } from 'react';
import { SearchParams } from '@/types/next'; // Assuming you have a type for searchParams
import { searchUpcomingReleases } from '@/lib/api/musicbrainz';
import { MusicBrainz } from '@/types/musicbrainz'; // Import the namespace
import { ReleaseEventCard } from './components/ReleaseEventCard';
import { CalendarSearchForm } from './components/CalendarSearchForm';
import { ErrorBoundary } from '@/components/common/ErrorBoundary'; // Assuming you have an ErrorBoundary
import { LoadingSpinner } from '@/components/common/LoadingSpinner'; // Assuming a LoadingSpinner

async function ReleasesList({ query }: { query?: string }) {
  // Fetch upcoming releases - adjust daysAhead or add more sophisticated filtering as needed
  let releases: MusicBrainz.ReleaseGroup[] = [];
  try {
    releases = await searchUpcomingReleases(query, 90);
  } catch (error) {
    console.error('Failed to fetch releases for calendar:', error);
    // The API client already logs and returns [], but you could throw here to be caught by ErrorBoundary
    // For now, returning an empty list to allow graceful UI handling.
  }

  if (releases.length === 0 && !query) {
    return (
      <p>
        No upcoming releases found in the next 90 days, or there was an issue
        fetching them.
      </p>
    );
  }
  if (releases.length === 0 && query) {
    return (
      <p>
        No upcoming releases found for your query: &quot;{query}&quot; in the
        next 90 days.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {releases.map((release) => (
        <ReleaseEventCard key={release.id} release={release} />
      ))}
    </div>
  );
}

export default function CalendarPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const query =
    typeof searchParams?.query === 'string' ? searchParams.query : undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Upcoming Releases</h1>
        <CalendarSearchForm initialQuery={query} />
      </div>

      <ErrorBoundary
        fallback={
          <p>Could not load releases at the moment. Please try again later.</p>
        }
      >
        <Suspense
          key={query} // Re-trigger suspense when query changes
          fallback={<LoadingSpinner className="mt-8 w-12 h-12 mx-auto" />}
        >
          <ReleasesList query={query} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Basic type for searchParams if not already defined elsewhere
// You might want to put this in a global types file like src/types/next.ts
// export interface SearchParams { [key: string]: string | string[] | undefined };
