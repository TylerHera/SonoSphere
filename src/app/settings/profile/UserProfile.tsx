'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/(auth)/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CheckCircle,
  LockKeyhole,
  PlusCircle,
  MinusCircle,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Mock data - In a real app, this would come from the backend
interface MockBadge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

const allEarnedBadgesMock: MockBadge[] = [
  {
    id: '1',
    name: 'Scrobbler I',
    description: '100 scrobbles',
    category: 'Milestones',
    icon_url: 'https://placehold.co/48x48/green/white?text=S1',
  },
  {
    id: '3',
    name: 'New Artist Explorer',
    description: '5 new artists',
    category: 'Discovery',
    icon_url: 'https://placehold.co/48x48/blue/white?text=NAE',
  },
  {
    id: '6',
    name: 'Streaker: 7 Days',
    description: 'Listened 7 days straight',
    category: 'Milestones',
    icon_url: 'https://placehold.co/48x48/orange/white?text=S7',
  },
  {
    id: '7',
    name: 'Jazz Connoisseur',
    description: 'Listened to 20 Jazz tracks',
    category: 'Genre',
    icon_url: 'https://placehold.co/48x48/purple/white?text=JZ',
  },
  {
    id: '8',
    name: 'Rock Solid',
    description: 'Listened to 50 Rock tracks',
    category: 'Genre',
    icon_url: 'https://placehold.co/48x48/red/white?text=RK',
  },
];

const MAX_SHOWCASED_BADGES = 3;

export default function UserProfile() {
  const { user, isLoading } = useAuth();
  const [showcasedBadges, setShowcasedBadges] = useState<string[]>([]); // Array of badge IDs
  // In a real app, fetch user.profile.showcased_badge_ids and allEarnedBadges

  useEffect(() => {
    // Simulate fetching initial showcased badges (e.g. first 2 earned if less than MAX_SHOWCASED_BADGES)
    if (user) {
      // This would normally come from user profile data (e.g. user.user_metadata.showcased_badge_ids)
      const initialShowcased = allEarnedBadgesMock
        .slice(0, MAX_SHOWCASED_BADGES - 1)
        .map((b) => b.id);
      setShowcasedBadges(initialShowcased);
    }
  }, [user]);

  const handleToggleShowcaseBadge = (badgeId: string) => {
    setShowcasedBadges((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((id) => id !== badgeId);
      }
      if (prev.length < MAX_SHOWCASED_BADGES) {
        return [...prev, badgeId];
      }
      toast.warning(
        `You can showcase a maximum of ${MAX_SHOWCASED_BADGES} badges.`,
      );
      return prev;
    });
  };

  const handleSaveChanges = async () => {
    // TODO: Implement API call to save showcasedBadges to user profile
    toast.success('Showcased badges saved! (Mock)');
    console.log('Saving showcased badges:', showcasedBadges);
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    // This should ideally not happen if the page is protected
    // Or AuthProvider should redirect to login if no user
    return (
      <p>
        No user logged in. Please <a href="/login">login</a>.
      </p>
    );
  }

  const handleSignOut = async () => {
    await signOut(); // Server action will handle redirect
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {/* Display current showcased badges (read-only view) */}
          <div>
            <h3 className="text-md font-semibold mb-2">Showcased Badges:</h3>
            {showcasedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {showcasedBadges.map((badgeId) => {
                  const badge = allEarnedBadgesMock.find(
                    (b) => b.id === badgeId,
                  );
                  return badge ? (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-2 border rounded-md bg-muted/50 w-24 text-center"
                    >
                      {badge.icon_url ? (
                        <Image
                          src={badge.icon_url}
                          alt={badge.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full mb-1"
                        />
                      ) : (
                        <Star className="w-10 h-10 text-yellow-400 mb-1" />
                      )}
                      <p className="text-xs truncate w-full" title={badge.name}>
                        {badge.name}
                      </p>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No badges showcased yet. Select some below!
              </p>
            )}
          </div>
          <form action={handleSignOut} className="mt-6">
            <Button type="submit" variant={'destructive' as any}>
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customize Showcased Badges</CardTitle>
          <CardDescription>
            Select up to {MAX_SHOWCASED_BADGES} of your earned badges to display
            on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allEarnedBadgesMock.length === 0 && (
            <p className="text-muted-foreground">
              You haven&apos;t earned any badges yet. Keep listening and
              collecting!
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {allEarnedBadgesMock.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleToggleShowcaseBadge(badge.id)}
                className={`p-3 border rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary 
                            ${showcasedBadges.includes(badge.id) ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted/50'}`}
              >
                {badge.icon_url ? (
                  <Image
                    src={badge.icon_url}
                    alt={badge.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mx-auto mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <p
                  className="text-sm font-medium truncate w-full"
                  title={badge.name}
                >
                  {badge.name}
                </p>
                <p
                  className="text-xs text-muted-foreground truncate w-full"
                  title={badge.description}
                >
                  {badge.description}
                </p>
                {showcasedBadges.includes(badge.id) ? (
                  <MinusCircle className="w-5 h-5 text-red-500 mx-auto mt-2" />
                ) : (
                  showcasedBadges.length < MAX_SHOWCASED_BADGES && (
                    <PlusCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                  )
                )}
              </button>
            ))}
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={allEarnedBadgesMock.length === 0}
          >
            Save Showcased Badges
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
