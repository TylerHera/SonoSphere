import Link from 'next/link';
import { signUp } from '@/app/(auth)/actions';
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
            Enter your email and password to sign up for SonoSphere.
          </CardDescription>
        </CardHeader>
        <form action={signUp}>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <p className="text-sm font-medium text-destructive">
                {decodeURIComponent(searchParams.error)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {/* Consider adding password confirmation and strength indicator here */}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">Sign Up</Button>
            <Button variant="outline" className="w-full" disabled>
              {/* Add Discogs Icon here if available */}
              Sign Up with Discogs (Coming Soon)
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 