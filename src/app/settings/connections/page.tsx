'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuthorizationUrl as getLastfmAuthUrl } from '@/lib/api/lastfm';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ConnectionsPage() {
  const { user, session } = useAuth();
  const [lastfmSessionKey, setLastfmSessionKey] = useState<string | null>(null);
  const [isLoadingLastfm, setIsLoadingLastfm] = useState(true);

  useEffect(() => {
    const checkLastfmConnection = async () => {
      if (user) {
        // Check if last.fm session key is stored in user metadata or a separate table
        // For this example, let's assume it's in public.profiles.lastfm_session_key
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('lastfm_session_key')
          .eq('id', user.id)
          .single();

        if (data && data.lastfm_session_key) {
          setLastfmSessionKey(data.lastfm_session_key);
        }
        if (error && error.code !== 'PGRST116') {
          // PGRST116: no rows found
          console.error('Error fetching lastfm session key:', error);
          toast.error('Could not check Last.fm connection.');
        }
      }
      setIsLoadingLastfm(false);
    };
    checkLastfmConnection();
  }, [user]);

  const handleConnectLastfm = () => {
    const callbackUrl = process.env.NEXT_PUBLIC_LASTFM_CALLBACK_URL;
    if (!callbackUrl) {
      console.error('Last.fm callback URL not configured.');
      toast.error('Last.fm callback URL not configured.');
      return;
    }
    window.location.href = getLastfmAuthUrl(callbackUrl);
  };

  const handleDisconnectLastfm = async () => {
    if (!user) return;
    setIsLoadingLastfm(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ lastfm_session_key: null })
      .eq('id', user.id);

    if (error) {
      console.error('Error disconnecting Last.fm:', error);
      toast.error('Failed to disconnect Last.fm.');
    } else {
      setLastfmSessionKey(null);
      toast.success('Disconnected from Last.fm.');
    }
    setIsLoadingLastfm(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold">Service Connections</h1>
      <Card>
        <CardHeader>
          <CardTitle>Last.fm Scrobbling</CardTitle>
          <CardDescription>
            Connect your Last.fm account to scrobble your listening history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLastfm ? (
            <p>Loading Last.fm connection status...</p>
          ) : lastfmSessionKey ? (
            <div className="flex items-center justify-between">
              <p className="text-green-600">Connected to Last.fm</p>
              <Button variant="destructive" onClick={handleDisconnectLastfm}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnectLastfm}>Connect to Last.fm</Button>
          )}
        </CardContent>
      </Card>
      {/* Add more service connections here, e.g., Spotify if needed for other things */}
    </div>
  );
}
