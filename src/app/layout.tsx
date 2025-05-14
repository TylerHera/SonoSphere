import React from 'react';
import '@/styles/globals.css'; // Import global styles
import { AuthProvider } from '@/components/providers/AuthProvider'; // Import AuthProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* Wrap children with AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 