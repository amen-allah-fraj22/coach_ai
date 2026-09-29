"use client";

import { ReactNode, useMemo } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

/**
 * Wires Clerk (identity) to Convex (data). ConvexProviderWithClerk passes
 * the Clerk-issued JWT to Convex on every request, which Convex verifies
 * against auth.config.ts. Client-side because both providers use React
 * context and hooks.
 */
export function Providers({ children }: { children: ReactNode }) {
  const convex = useMemo(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
    [],
  );

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
