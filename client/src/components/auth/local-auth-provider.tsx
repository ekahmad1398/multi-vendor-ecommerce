"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getBackendProfile, logout as logoutRequest, type BackendUser } from "@/services/auth";

type AuthState = {
  user: BackendUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  refresh: () => Promise<BackendUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    try {
      const account = await getBackendProfile();
      setUser(account);
      queryClient.setQueryData(["backend-profile"], account);
      return account;
    } catch {
      setUser(null);
      queryClient.removeQueries({ queryKey: ["backend-profile"] });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const signOut = useCallback(async () => {
    try { await logoutRequest(); } finally { setUser(null); queryClient.removeQueries({ queryKey: ["backend-profile"] }); }
  }, [queryClient]);

  const value = useMemo(() => ({ user, isLoading, isSignedIn: Boolean(user), refresh, signOut }), [user, isLoading, refresh, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useLocalAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useLocalAuth must be used inside LocalAuthProvider");
  return context;
}
