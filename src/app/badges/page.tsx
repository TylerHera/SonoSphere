'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, LockKeyhole } from 'lucide-react'; // Icons for earned/locked
import { Badge as UiBadge } from '@/components/ui/badge'; // Renaming to avoid conflict with Badge model type

// Mock data - In a real app, this would come from the backend
// And Badge type would be imported from Prisma types or DTOs
interface MockBadge {
  id: string;
  name: string;
  description: string;
  icon_url?: string; // Placeholder for icon display
  category: string;
  points: number;
  isEarned: boolean; // Simplified for mock
  progress?: string; // e.g., "50/100 scrobbles"
}

const mockBadgesData: MockBadge[] = [
  {
    id: '1',
    name: 'Scrobbler I',
    description: 'Achieve 100 total scrobbles.',
    category: 'Listening Milestones',
    points: 10,
    isEarned: true,
    icon_url: 'https://placehold.co/64x64/green/white?text=S1'
  },
  {
    id: '2',
    name: 'Track Fanatic I',
    description: 'Listen to a single track 10 times.',
    category: 'Listening Milestones',
    points: 20,
    isEarned: false,
    progress: '7/10 plays for "Bohemian Rhapsody"'
  },
  {
    id: '3',
    name: 'New Artist Explorer',
    description: 'Listen to 5 new artists this month.',
    category: 'Discovery',
    points: 15,
    isEarned: true,
    icon_url: 'https://placehold.co/64x64/blue/white?text=NAE'
  },
  {
    id: '4',
    name: 'Collector I',
    description: 'Add 10 items to your vinyl collection.',
    category: 'Collection',
    points: 25,
    isEarned: false,
    progress: '3/10 items added'
  },
   {
    id: '5',
    name: 'Genre Explorer: Jazz',
    description: 'Listen to 10 tracks in the Jazz genre.',
    category: 'Discovery',
    points: 15,
    isEarned: false,
    progress: '2/10 Jazz tracks'
  },
  {
    id: '6',
    name: 'Streaker: 7 Days',
    description: 'Listen to music 7 days in a row.',
    category: 'Listening Milestones',
    points: 50,
    isEarned: true,
    icon_url: 'https://placehold.co/64x64/orange/white?text=S7'
  },
];

export default function BadgesPage() {
  const { session } = useAuth();
  // const [badges, setBadges] = useState<MockBadge[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // Fetch all badges and user's earned status from backend
  //   // For now, using mock data
  //   if (session) {
  //     setBadges(mockBadgesData); // Adapt this if fetching user-specific earned status
  //   } else {
  //     // Handle case where user is not logged in, maybe show all as locked
  //     const allLockedBadges = mockBadgesData.map(b => ({ ...b, isEarned: false, progress: undefined }));
  //     setBadges(allLockedBadges);
  //   }
  //   setIsLoading(false);
  // }, [session]);

  // For now, directly use mock data
  const badgesToDisplay = session 
    ? mockBadgesData 
    : mockBadgesData.map(b => ({ ...b, isEarned: false, progress: undefined }));

  const categories = Array.from(new Set(badgesToDisplay.map(b => b.category)));

  // if (isLoading) return <div className="container mx-auto py-8 text-center"><LoadingSpinner /> <p>Loading badges...</p></div>;
  // if (error) return <div className="container mx-auto py-8"><p className="text-red-500">Error: {error}</p></div>;
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Your Achievements</h1>
        <p className="text-muted-foreground mt-2">Track your progress and unlock badges for your listening habits and collection!</p>
      </div>

      {categories.map(category => (
        <section key={category} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badgesToDisplay.filter(b => b.category === category).map(badge => (
              <Card 
                key={badge.id} 
                className={`flex flex-col items-center text-center p-6 transition-all hover:shadow-lg ${badge.isEarned ? 'border-green-500 bg-green-500/10' : 'border-dashed opacity-70 hover:opacity-100'}`}
              >
                {badge.icon_url ? (
                  <img src={badge.icon_url} alt={badge.name} className="w-16 h-16 mb-3 rounded-full bg-muted" />
                ) : (
                  <div className="w-16 h-16 mb-3 rounded-full bg-muted flex items-center justify-center">
                    {badge.isEarned ? <CheckCircle className="w-8 h-8 text-green-600" /> : <LockKeyhole className="w-8 h-8 text-muted-foreground" />}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 flex-grow">{badge.description}</p>
                <UiBadge variant={badge.isEarned ? "default" : "outline"} className="mb-2">
                  {badge.isEarned ? `Earned (+${badge.points} pts)` : `${badge.points} pts`}
                </UiBadge>
                {!badge.isEarned && badge.progress && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">Progress: {badge.progress}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
      {!session && (
         <Card className="mt-8 text-center p-6 bg-amber-500/10 border-amber-500">
            <CardTitle>Login to See Your Progress</CardTitle>
            <CardDescription className="mt-2">You are viewing all available badges. Login to see which ones you've earned and track your progress!</CardDescription>
            {/* TODO: Add Login Button here if feasible without prop drilling router */}
        </Card>
      )}
    </div>
  );
} 