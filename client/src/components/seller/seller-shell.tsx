"use client";

import Link from "next/link";
import { BarChart3, Package, ShoppingCart, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { RoleGate } from "@/components/auth/role-gate";

const items = [
  [BarChart3, "Dashboard", "/seller"],
  [Package, "Products", "/seller/products"],
  [ShoppingCart, "Orders", "/seller/orders"],
  [UserRound, "Profile", "/seller/profile"],
] as const;

export function SellerShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <RoleGate roles={["vendor"]}><div className="workspace-shell">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[240px_1fr]">
        <aside className="workspace-sidebar p-5 text-slate-300 lg:min-h-screen">
          <Link href="/seller" className="font-serif text-3xl text-white">
            morrow<span className="text-violet-400">.</span>{" "}
            <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Vendor</span>
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
    </div></RoleGate>
  );
}
