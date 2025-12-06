'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add refetchInterval to reduce blocking, and disable automatic refetching
  return (
    <SessionProvider
      refetchInterval={300} // Refetch every 5 minutes instead of default
      refetchOnWindowFocus={false} // Disable refetch on window focus to reduce blocking
    >
      {children}
    </SessionProvider>
  );
}