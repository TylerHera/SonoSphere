'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: origin + '/auth/callback', // If email confirmation is enabled
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    // Consider returning a more user-friendly error message or redirecting with an error query param
    return redirect('/signup?error=' + encodeURIComponent(error.message));
  }
  
  // For server-side sign-up, Supabase handles cookies. Redirection might be to a pending verification page or login.
  // If email confirmation is required, user will get an email.
  // If not, they are logged in.
  return redirect('/'); // Redirect to home page or a dashboard after successful signup/pending verification
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return redirect('/login?error=' + encodeURIComponent(error.message));
  }

  return redirect('/'); // Redirect to home page or dashboard
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/login');
} 