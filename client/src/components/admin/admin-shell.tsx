"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, FolderTree, Package, ShoppingCart, Store, Users } from "lucide-react";

const items = [
  [ChartNoAxesCombined, "Dashboard", "/admin"],
  [Package, "Products", "/admin/products"],
  [FolderTree, "Categories", "/admin/categories"],
  [ShoppingCart, "Orders", "/admin/orders"],
  [Store, "Vendors", "/admin/sellers"],
  [Users, "Customers", "/admin/users"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="workspace-shell">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[250px_1fr]">
        <aside className="workspace-sidebar border-b border-white/10 p-5 text-slate-300 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href="/admin" className="font-serif text-3xl text-white">
            morrow<span className="text-violet-400">.</span>{" "}
            <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Admin</span>
          </Link>
          <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col">
            {items.map(([Icon, name, href]) => (
              <Link
                key={name}
                href={href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-white/10 hover:text-white ${path === href ? "bg-white/10 text-white" : ""}`}
              >
                <Icon size={18} />
                {name}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block border-t border-white/10 pt-5 text-xs leading-5 text-slate-500 lg:mt-10">
            Back to storefront
          </Link>
        </aside>
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
