import React from 'react';
import '@/styles/globals.css'; // Import global styles
import { AuthProvider } from '@/components/providers/AuthProvider'; // Import AuthProvider
import { SpotifyPlayerProvider } from '@/components/providers/SpotifyPlayerProvider'; // Import SpotifyPlayerProvider
import { AppleMusicProvider } from '@/components/providers/AppleMusicProvider';
import { SpotifyPlayer } from '@/components/player/SpotifyPlayer'; // Import the player UI
import { Toaster } from '@/components/ui/sonner'; // Assuming you might want toast notifications
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'SonoSphere',
  description: 'Your personal music and vinyl collection hub.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SpotifyPlayerProvider>
              <AppleMusicProvider>
                <div className="relative flex min-h-screen flex-col bg-background">
                  {/* <SiteHeader /> */}
                  <main className="flex-1 pb-24">
                    {/* Added pb-24 for player */} {children}
                  </main>
                  {/* <SiteFooter /> */}
                  <SpotifyPlayer /> {/* Using SpotifyPlayer directly for now */}
                </div>
                <Toaster richColors />
              </AppleMusicProvider>
            </SpotifyPlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
