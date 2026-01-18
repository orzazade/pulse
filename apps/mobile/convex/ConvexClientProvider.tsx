"use client";

import { useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (!convexUrl) {
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, []);

  if (!client) {
    // Convex not configured yet - render children without provider
    // This allows the app to run during initial setup
    console.warn(
      "Convex not configured. Set EXPO_PUBLIC_CONVEX_URL in .env.local"
    );
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
