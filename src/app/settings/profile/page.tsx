import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserProfile from './UserProfile'; // Client component for profile details

export default async function ProfilePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    // If no user or error, redirect to login
    // This also protects the route server-side
    redirect('/login');
  }

  // Pass necessary user data to the client component if needed,
  // or let the client component fetch it via useAuth()
  // For this basic page, UserProfile component will use useAuth()

  return (
    <div className="container mx-auto py-8 px-4">
      <UserProfile />
    </div>
  );
} 