"use client";

import Link from "next/link";
import { BarChart3, Package, ShoppingCart, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBackendProfile } from "@/services/auth";
import { ErrorState } from "@/components/ui/primitives";
import { usePathname } from "next/navigation";

const items = [
  [BarChart3, "Dashboard", "/seller"],
  [Package, "Products", "/seller/products"],
  [ShoppingCart, "Orders", "/seller/orders"],
  [UserRound, "Profile", "/seller/profile"],
] as const;

export function SellerShell({ children }: { children: React.ReactNode }) {
  const query = useQuery({ queryKey: ["backend-profile"], queryFn: getBackendProfile, retry: false });
  const path = usePathname();
  if (query.isLoading) return <div className="min-h-screen bg-slate-100" />;
  if (query.data?.role !== "seller") {
    return (
      <div className="shell py-16">
        <ErrorState />
        <p className="mt-4 text-center text-sm text-slate-500">Seller access is required for this area.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[240px_1fr]">
        <aside className="bg-slate-950 p-5 text-slate-300 lg:min-h-screen">
          <Link href="/seller" className="font-serif text-3xl text-white">
            morrow<span className="text-amber-400">.</span>{" "}
            <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Seller</span>
          </Link>
          <nav className="mt-10 flex gap-2 overflow-x-auto lg:flex-col">
            {items.map(([Icon, name, href]) => (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/10 hover:text-white ${path === href ? "bg-white/10 text-white" : ""}`}
              >
                <Icon size={18} />
                {name}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block text-xs text-slate-500">
            Back to storefront
          </Link>
        </aside>
        <main className="min-w-0 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
