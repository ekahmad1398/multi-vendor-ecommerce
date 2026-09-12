"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useLocalAuth } from "@/components/auth/local-auth-provider";
import type { AppRole } from "@/services/auth";

export function RoleGate({ roles, children }: { roles: AppRole[]; children: React.ReactNode }) {
  const { user, isLoading } = useLocalAuth();
  const path = usePathname();
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useAuth();
  const isWaitingForClerkBridge = isClerkLoaded && isClerkSignedIn && !user;

  useEffect(() => {
    if (isLoading || !isClerkLoaded || isWaitingForClerkBridge) return;
    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent(path)}`);
    } else if (!roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [isClerkLoaded, isLoading, isWaitingForClerkBridge, path, roles, router, user]);

  // Do not render protected content while the cookie-backed MongoDB profile is loading
  // or while an unauthorized visitor is being redirected.
  if (isLoading || !isClerkLoaded || isWaitingForClerkBridge || !user || !roles.includes(user.role)) return <div className="min-h-screen bg-slate-100" />;
  return <>{children}</>;
}
