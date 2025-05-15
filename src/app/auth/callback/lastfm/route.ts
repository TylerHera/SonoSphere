import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession as getLastfmSession } from '@/lib/api/lastfm';
import { toast } from 'sonner'; // For server-side, this won't render, but useful if logic moves client-side

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    console.error('Last.fm OAuth Error: No token provided.');
    // Redirect to an error page or settings page with an error message
    return NextResponse.redirect(
      `${origin}/settings/connections?error=lastfm_token_missing`,
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('Last.fm OAuth Error: User not authenticated.');
    return NextResponse.redirect(
      `${origin}/login?error=user_not_authenticated&next=/settings/connections`,
    );
  }

  try {
    const sessionResponse = await getLastfmSession(token);

    if ('error' in sessionResponse) {
      console.error('Last.fm GetSession Error:', sessionResponse.message);
      return NextResponse.redirect(
        `${origin}/settings/connections?error=lastfm_session_failed&code=${sessionResponse.error}`,
      );
    }

    if (
      !sessionResponse.session ||
      !sessionResponse.session.key ||
      !sessionResponse.session.name
    ) {
      console.error(
        'Last.fm GetSession Error: Invalid session data received.',
        sessionResponse,
      );
      return NextResponse.redirect(
        `${origin}/settings/connections?error=lastfm_invalid_session_data`,
      );
    }

    const { name: lastfmUsername, key: lastfmSessionKey } =
      sessionResponse.session;

    // Store the lastfm_session_key and lastfm_username in the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        lastfm_session_key: lastfmSessionKey,
        lastfm_username: lastfmUsername,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(
        'Error updating profile with Last.fm session:',
        updateError,
      );
      return NextResponse.redirect(
        `${origin}/settings/connections?error=lastfm_db_update_failed`,
      );
    }

    // Successfully connected
    // toast.success('Successfully connected to Last.fm!'); // Server-side toast won't show here
    return NextResponse.redirect(
      `${origin}/settings/connections?success=lastfm_connected`,
    );
  } catch (error) {
    console.error('Last.fm callback internal error:', error);
    return NextResponse.redirect(
      `${origin}/settings/connections?error=lastfm_internal_error`,
    );
  }
}
