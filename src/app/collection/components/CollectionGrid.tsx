import { DiscogsRelease } from '@/lib/api/discogs';
import AlbumCard from './AlbumCard';

interface CollectionGridProps {
  releases: DiscogsRelease[];
}

export default function CollectionGrid({ releases }: CollectionGridProps) {
  if (!releases || releases.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No releases found.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {releases.map((release) => (
        <AlbumCard key={release.id} release={release} />
      ))}
    </div>
  );
}
