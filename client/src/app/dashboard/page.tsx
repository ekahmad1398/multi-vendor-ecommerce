"use client";

import Link from "next/link";
import { Heart, Package, Store, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalAuth } from "@/components/auth/local-auth-provider";
import { RoleGate } from "@/components/auth/role-gate";

const items = [
  [UserRound, "Account", "/profile"],
  [Package, "Orders", "/orders"],
  [Heart, "Wishlist", "/wishlist"],
] as const;

export default function DashboardPage() {
  return <RoleGate roles={["customer", "vendor", "admin"]}><DashboardContent /></RoleGate>;
}

function DashboardContent() {
  const { user, isLoading } = useLocalAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.role === "admin") router.replace("/admin");
    if (user.role === "vendor") router.replace("/seller");
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "customer") return <div className="min-h-screen bg-slate-100" />;

  return (
    <div className="workspace-shell">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[240px_1fr]">
        <aside className="workspace-sidebar border-b border-white/10 p-5 text-slate-300 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="font-serif text-3xl text-white">morrow<span className="text-violet-400">.</span> <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Customer</span></Link>
          <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col">
            {items.map(([Icon, label, href]) => <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-white/10 hover:text-white"><Icon size={18} />{label}</Link>)}
          </nav>
          <Link href="/" className="mt-8 block border-t border-white/10 pt-5 text-xs text-slate-500 lg:mt-10">Back to storefront</Link>
        </aside>
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">
          <p className="eyebrow text-violet-700">Customer dashboard</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-4 max-w-xl text-slate-600">Manage your account, orders, and saved items in one place.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map(([Icon, label, href]) => <Link key={href} href={href} className="card p-6 hover:border-violet-300"><Icon className="text-violet-700" size={21} /><h2 className="mt-8 font-serif text-2xl">{label}</h2><p className="mt-1 text-sm text-slate-500">Open your {label.toLowerCase()}.</p></Link>)}
          </div>
          <Link href="/products" className="btn btn-dark mt-8"><Store size={17} /> Continue shopping</Link>
        </main>
      </div>
    </div>
  );
}
