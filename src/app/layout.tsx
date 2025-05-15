import React from 'react';
import '@/styles/globals.css'; // Import global styles
import { AuthProvider } from '@/components/providers/AuthProvider'; // Import AuthProvider
import { SpotifyPlayerProvider } from '@/components/providers/SpotifyPlayerProvider'; // Import SpotifyPlayerProvider
import { SpotifyPlayer } from '@/components/player/SpotifyPlayer'; // Import the player UI
import { Toaster } from "@/components/ui/sonner"; // Assuming you might want toast notifications

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider> {/* Wrap children with AuthProvider */}
          <SpotifyPlayerProvider> {/* Wrap with SpotifyPlayerProvider */}
            {/* TODO: Add main navigation (Header/Sidebar) here above children */}
            <main className="pb-24"> {/* Add padding to bottom to avoid overlap with player*/}
              {children}
            </main>
            <SpotifyPlayer /> {/* Render the player UI */}
            <Toaster /> {/* For potential notifications */}
          </SpotifyPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 