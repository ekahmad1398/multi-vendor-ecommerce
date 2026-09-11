"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { useLocalAuth } from "@/components/auth/local-auth-provider";

export default function ClerkCallbackPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { refresh } = useLocalAuth();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || started.current) return;
    started.current = true;
    let cancelled = false;
    const connect = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your Clerk session has expired. Please sign in again.");
        await api.post("/auth/clerk", undefined, { headers: { Authorization: `Bearer ${token}` } });
        await refresh();
        if (!cancelled) router.replace("/");
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Could not connect your Clerk account.");
          router.replace("/sign-in");
        }
      }
    };
    void connect();
    return () => { cancelled = true; };
  }, [getToken, isLoaded, isSignedIn, refresh, router]);

  return <main className="shell grid min-h-[76vh] place-items-center py-10"><div className="auth-card w-full max-w-md p-8 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" /><p className="mt-5 font-serif text-3xl">Finishing sign in</p><p className="mt-2 text-sm text-slate-500">Connecting your account to the store...</p></div></main>;
}