'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// TODO: Fetch active challenges and user progress from backend
const mockChallenges = [
  {
    id: '1',
    name: 'Genre Journey: Jazz',
    description: 'Listen to 5 tracks from the Jazz genre this month.',
    progress: '2/5 tracks',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Decade Explorer: 1970s Album',
    description: 'Listen to a full album released in the 1970s.',
    progress: 'Not started',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Weekly Discovery Champion',
    description: 'Listen to at least 3 tracks from your Spotify Discover Weekly playlist.',
    progress: 'Completed',
    status: 'Completed',
  },
];

export default function ChallengesPage() {
  // const [challenges, setChallenges] = useState([]); // TODO: Real state
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect to fetch challenges

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listening Challenges</h1>
        {/* <Button>View Completed</Button> */}
      </div>

      {/* TODO: Add filtering (Active, Completed, All) */}

      {mockChallenges.length === 0 && !true /*!isLoading*/ && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No active challenges right now. Check back soon!</p>
          </CardContent>
        </Card>
      )}

      {/* {isLoading && <LoadingSpinner />} */}
      {/* {error && <p className="text-red-500">Error loading challenges: {error}</p>} */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockChallenges.map((challenge) => (
          <Card key={challenge.id} className={`flex flex-col ${challenge.status === 'Completed' ? 'bg-muted/50' : ''}`}>
            <CardHeader>
              <CardTitle>{challenge.name}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Status: {challenge.status}</p>
              <p className="text-sm text-muted-foreground">Progress: {challenge.progress}</p>
              {/* TODO: Add more details like time remaining, rewards, etc. */}
            </CardContent>
            {challenge.status !== 'Completed' && (
                 <div className="p-6 pt-0">
                    {/* <Button className="w-full">View Details / Log Progress (TODO)</Button> */}
                 </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">More features like creating custom challenges and detailed progress tracking are coming soon!</p>
      </div>
    </div>
  );
} 