"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getBackendProfile, logout as logoutRequest, type BackendUser } from "@/services/auth";

type AuthState = {
  user: BackendUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  refresh: () => Promise<BackendUser | null>;
  setSession: (user: BackendUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const refreshVersion = useRef(0);

  const setSession = useCallback((account: BackendUser) => {
    // A login response is issued by our backend after its MongoDB user lookup.
    // Store it immediately so a dashboard never waits for a second request.
    refreshVersion.current += 1;
    setUser(account);
    setIsLoading(false);
    queryClient.setQueryData(["backend-profile"], account);
  }, [queryClient]);

  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    try {
      const account = await getBackendProfile();
      if (version !== refreshVersion.current) return null;
      setUser(account);
      queryClient.setQueryData(["backend-profile"], account);
      return account;
    } catch {
      // Do not let an older initial profile request erase a just-completed login.
      if (version !== refreshVersion.current) return null;
      setUser(null);
      queryClient.removeQueries({ queryKey: ["backend-profile"] });
      return null;
    } finally {
      if (version === refreshVersion.current) setIsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const signOut = useCallback(async () => {
    try { await logoutRequest(); } finally { refreshVersion.current += 1; setUser(null); queryClient.removeQueries({ queryKey: ["backend-profile"] }); }
  }, [queryClient]);

  const value = useMemo(() => ({ user, isLoading, isSignedIn: Boolean(user), refresh, setSession, signOut }), [user, isLoading, refresh, setSession, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useLocalAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useLocalAuth must be used inside LocalAuthProvider");
  return context;
}
