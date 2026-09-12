"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { useLocalAuth } from "@/components/auth/local-auth-provider";

// Clerk remains an optional sign-in method. Once verified, we exchange its
// session for the same secure backend cookie used by local-password accounts.
export function ClerkBridge() {
  const { isLoaded, isSignedIn, sessionId, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const { user, isLoading, refresh } = useLocalAuth();
  const bridgedSession = useRef<string | null>(null);

  useEffect(() => {
    // Wait for the local session lookup. This prevents a persisted Clerk session
    // from replacing an intentional local-password session during app startup.
    if (!isLoaded || isLoading || !isSignedIn || !sessionId || user || bridgedSession.current === sessionId) return;
    let cancelled = false;
    const bridge = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your Clerk session has expired. Please sign in again.");
        await api.post("/auth/clerk", undefined, { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled) { bridgedSession.current = sessionId; await refresh(); }
      } catch (error) {
        if (!cancelled) {
          await clerkSignOut();
          toast.error(error instanceof Error ? error.message : "Could not connect your Clerk account.");
        }
      }
    };
    void bridge();
    return () => { cancelled = true; };
  }, [clerkSignOut, getToken, isLoaded, isLoading, isSignedIn, refresh, sessionId, user]);
  return null;
}
