"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";

const bridgeKey = "morrow.clerk.bridgeSession";

export function ClerkBridge() {
  const { isLoaded, isSignedIn, sessionId, getToken } = useAuth();
  const client = useQueryClient();
  const lastSession = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const logoutLocalSession = async () => {
      if (!sessionStorage.getItem(bridgeKey)) return;
      try { await api.post("/auth/logout"); } finally {
        sessionStorage.removeItem(bridgeKey);
        client.removeQueries({ queryKey: ["backend-profile"] });
        client.removeQueries({ queryKey: ["cart"] });
        client.removeQueries({ queryKey: ["wishlist"] });
        client.removeQueries({ queryKey: ["orders"] });
      }
    };
    if (!isSignedIn || !sessionId) { void logoutLocalSession(); return; }

    let cancelled = false;
    const bridge = async (notify = false) => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your Clerk session has expired. Please sign in again.");
        await api.post("/auth/clerk", undefined, { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled) {
          sessionStorage.setItem(bridgeKey, sessionId);
          lastSession.current = sessionId;
          client.invalidateQueries({ queryKey: ["backend-profile"] });
        }
      } catch (error) {
        if (!cancelled && (notify || lastSession.current !== sessionId)) toast.error(error instanceof Error ? error.message : "Unable to establish the store session.");
      }
    };
    void bridge(true);
    // Refresh the local JWT before it can drift from a valid Clerk session without exceeding auth rate limits.
    const refresh = window.setInterval(() => void bridge(false), 10 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(refresh); };
  }, [client, getToken, isLoaded, isSignedIn, sessionId]);

  return null;
}
