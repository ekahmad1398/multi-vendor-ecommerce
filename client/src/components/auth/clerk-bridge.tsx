"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { useLocalAuth } from "@/components/auth/local-auth-provider";

// Clerk remains an optional sign-in method. Once verified, we exchange its
// session for the same secure backend cookie used by local-password accounts.
export function ClerkBridge() {
  const { isLoaded, isSignedIn, sessionId, getToken } = useAuth();
  const { refresh } = useLocalAuth();
  const bridgedSession = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sessionId || bridgedSession.current === sessionId) return;
    let cancelled = false;
    const bridge = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your Clerk session has expired. Please sign in again.");
        await api.post("/auth/clerk", undefined, { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled) { bridgedSession.current = sessionId; await refresh(); }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Could not connect your Clerk account.");
      }
    };
    void bridge();
    return () => { cancelled = true; };
  }, [getToken, isLoaded, isSignedIn, refresh, sessionId]);
  return null;
}
