'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/(auth)/actions'; // Using the server action for signout

export default function UserProfile() {
  const { user, isLoading } = useAuth();

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">User Profile</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {/* Add more profile information here as needed */}
      <form action={handleSignOut}>
        <Button type="submit" variant="destructive">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
