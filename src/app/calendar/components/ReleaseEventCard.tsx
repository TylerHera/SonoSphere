import { MusicBrainz } from '@/types/musicbrainz';
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
import { differenceInDays, format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ReleaseEventCardProps {
  release: MusicBrainz.ReleaseGroup;
}

const CountdownBadge = ({ releaseDate }: { releaseDate: string }) => {
  if (!releaseDate) return null;
  try {
    const date = parseISO(releaseDate);
    const today = new Date();
    const daysUntil = differenceInDays(date, today);

    if (daysUntil < 0) {
      return (
        <Badge variant="outline">Released {format(date, 'MMM d, yyyy')}</Badge>
      );
    }
    if (daysUntil === 0) {
      return <Badge variant="secondary">Releases Today!</Badge>;
    }
    if (daysUntil <= 7) {
      return (
        <Badge variant="default">
          {daysUntil} day{daysUntil > 1 ? 's' : ''} left
        </Badge>
      );
    }
    return <Badge variant="outline">{format(date, 'MMM d, yyyy')}</Badge>; // Default for future dates > 7 days
  } catch (error) {
    console.error(
      'Error parsing release date for countdown:',
      releaseDate,
      error,
    );
    return <Badge variant="destructive">Invalid Date</Badge>;
  }
};

export function ReleaseEventCard({ release }: ReleaseEventCardProps) {
  const artistName =
    release['artist-credit']?.[0]?.artist?.name || 'Various Artists';
  const releaseDateFormatted = release['first-release-date']
    ? format(parseISO(release['first-release-date']), 'MMMM d, yyyy')
    : 'Date N/A';

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="p-4">
        {release.coverArtUrl ? (
          <div className="relative aspect-square w-full mb-2">
            <Image
              src={release.coverArtUrl}
              alt={`Cover for ${release.title}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="relative aspect-square w-full mb-2 bg-muted rounded-md flex items-center justify-center">
            <Image
              src={placeholderImage(200, 200)}
              alt="Placeholder image"
              width={100}
              height={100}
              className="opacity-50"
            />
          </div>
        )}
        <CardTitle
          className="text-lg leading-tight truncate"
          title={release.title}
        >
          {release.title}
        </CardTitle>
        <CardDescription className="truncate" title={artistName}>
          {artistName}
        </CardDescription>
        {release.disambiguation && (
          <CardDescription
            className="text-xs italic truncate"
            title={release.disambiguation}
          >
            ({release.disambiguation})
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">
          {release['primary-type'] || 'Release'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {release['first-release-date'] && (
          <CountdownBadge releaseDate={release['first-release-date']} />
        )}
        {/* <p className="text-xs text-muted-foreground truncate" title={releaseDateFormatted}>{releaseDateFormatted}</p> */}
      </CardFooter>
    </Card>
  );
}
