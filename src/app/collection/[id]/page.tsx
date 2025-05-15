import { getRelease, DiscogsRelease } from '@/lib/api/discogs';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { placeholderImage } from '@/lib/utils';

interface ReleaseDetailPageProps {
  params: { id: string };
}

export default async function ReleaseDetailPage({
  params,
}: ReleaseDetailPageProps) {
  const releaseId = parseInt(params.id, 10);

  if (isNaN(releaseId)) {
    return <p className="text-center text-destructive">Invalid Release ID.</p>;
  }

  try {
    const release: DiscogsRelease = await getRelease(releaseId);
    const displayArtists =
      release.artists?.map((artist) => artist.name).join(', ') ||
      release.artists_sort ||
      'Unknown Artist';

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <Image
              src={
                release.cover_image ||
                release.thumb ||
                placeholderImage(600, 600)
              }
              alt={`Cover for ${release.title}`}
              width={600}
              height={600}
              className="rounded-lg shadow-lg w-full object-contain"
              unoptimized={
                release.cover_image?.includes('discogs.com') ||
                release.thumb?.includes('discogs.com')
              }
            />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {release.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              By {displayArtists}
            </p>

            <div className="space-y-2 mb-6">
              {release.year && (
                <p>
                  <strong>Year:</strong> {release.year}
                </p>
              )}
              {release.labels && release.labels.length > 0 && (
                <p>
                  <strong>Label:</strong>{' '}
                  {release.labels
                    .map((l) => `${l.name} (${l.catno || 'N/A'})`)
                    .join(', ')}
                </p>
              )}
              {release.formats && release.formats.length > 0 && (
                <p>
                  <strong>Format:</strong>{' '}
                  {release.formats
                    .map(
                      (f: any) =>
                        `${f.name}${f.descriptions ? ' (' + f.descriptions.join(', ') + ')' : ''}`,
                    )
                    .join(', ')}
                </p>
              )}
            </div>

            {release.genres && release.genres.length > 0 && (
              <div className="mb-4">
                <strong>Genres:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {release.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {release.styles && release.styles.length > 0 && (
              <div className="mb-6">
                <strong>Styles:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {release.styles.map((style) => (
                    <Badge key={style} variant="outline">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {release.tracklist && release.tracklist.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">Tracklist</h2>
                <ol className="list-decimal list-inside space-y-1">
                  {release.tracklist.map((track) => (
                    <li key={track.position + track.title}>
                      {track.position}. {track.title}{' '}
                      {track.duration && `(${track.duration})`}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {release.notes && (
              <div className="mb-6 prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold mb-3">Notes</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: release.notes.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            )}

            <Link href="/collection" className="text-blue-500 hover:underline">
              &larr; Back to Collection Search
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Failed to fetch release ${releaseId}:`, error);
    return (
      <p className="text-center text-destructive">
        Failed to load release details. Please try again.
      </p>
    );
  }
}
