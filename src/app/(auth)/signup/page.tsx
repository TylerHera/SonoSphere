import Link from 'next/link';
import { signUp, signInWithSpotify } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Sign up with your email or use a provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.error && (
            <p className="text-sm font-medium text-destructive">
              {decodeURIComponent(searchParams.error)}
            </p>
          )}
          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {/* Consider adding password confirmation and strength indicator here */}
            </div>
            <Button type="submit" className="w-full">Sign Up with Email</Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form action={signInWithSpotify} className="w-full">
            <Button variant="outline" className="w-full">
              {/* Consider adding a Spotify Icon here */}
              Sign Up with Spotify
            </Button>
          </form>

        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="outline" className="w-full" disabled>
            {/* Add Discogs Icon here if available */}
            Sign Up with Discogs (Coming Soon)
          </Button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 