"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { getBackendProfile } from "@/services/auth";
import { ErrorState } from "@/components/ui/primitives";

export default function Layout({ children }: { children: React.ReactNode }) {
  const query = useQuery({ queryKey: ["backend-profile"], queryFn: getBackendProfile, retry: false });
  if (query.isLoading) return <div className="min-h-screen bg-slate-100" />;
  if (query.data?.role !== "admin") {
    return (
      <div className="shell py-16">
        <ErrorState />
        <p className="mt-4 text-center text-sm text-slate-500">Administrator access is required for this area.</p>
      </div>
    );
  }
  return <AdminShell>{children}</AdminShell>;
}
