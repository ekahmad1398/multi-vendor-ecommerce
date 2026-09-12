"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, Package, ShoppingBag, Store, UserRound } from "lucide-react";
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
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[248px_1fr]">
        <aside className="workspace-sidebar border-b border-white/10 p-5 text-slate-300 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="font-serif text-3xl text-white">morrow<span className="text-violet-400">.</span> <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Customer</span></Link>
          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block"><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">Your account</p><p className="mt-2 truncate font-medium text-white">{user.email}</p><p className="mt-1 text-xs text-teal-300">{user.isEmailVerified ? "Verified member" : "Member account"}</p></div>
          <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col">
            {items.map(([Icon, label, href]) => <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-white/10 hover:text-white"><Icon size={18} />{label}</Link>)}
          </nav>
          <Link href="/" className="mt-8 block border-t border-white/10 pt-5 text-xs text-slate-500 lg:mt-10">Back to storefront</Link>
        </aside>
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">
          <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-7"><div><p className="eyebrow">Customer dashboard</p><h1 className="mt-2 font-serif text-5xl tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1><p className="mt-3 max-w-xl text-slate-600">Everything for your account, orders, and saved pieces — in one place.</p></div><Link href="/products" className="btn btn-dark"><ShoppingBag size={17} /> Continue shopping</Link></header>
          <section className="mt-7 grid gap-4 sm:grid-cols-3">
            {items.map(([Icon, label, href]) => <Link key={href} href={href} className="dashboard-card group hover:border-violet-300 hover:shadow-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon size={20} /></span><div className="mt-6 flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><h2 className="mt-1 font-serif text-2xl text-slate-950">{label === "Account" && user.isEmailVerified ? "Verified" : "Open"}</h2></div><ArrowUpRight size={18} className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600" /></div><p className="mt-2 text-sm text-slate-500">{label === "Account" ? "Profile and account details" : label === "Orders" ? "Track deliveries and purchases" : "Your saved pieces"}</p></Link>)}
          </section>
          <section className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
            <div className="card p-6"><p className="eyebrow">Quick actions</p><h2 className="mt-2 font-serif text-3xl">Make your next move.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><Link href="/products" className="rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50"><Store size={19} className="text-violet-700" /><p className="mt-5 font-semibold">Browse new arrivals</p><p className="mt-1 text-sm text-slate-500">Find a new favourite.</p></Link><Link href="/profile" className="rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50"><UserRound size={19} className="text-violet-700" /><p className="mt-5 font-semibold">Update your profile</p><p className="mt-1 text-sm text-slate-500">Keep account details current.</p></Link></div></div>
            <div className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-300">Morrow member</p><h2 className="mt-3 font-serif text-3xl leading-none">Good things are waiting.</h2><p className="mt-4 text-sm leading-6 text-slate-300">Save the pieces you love and return whenever you are ready.</p><Link href="/wishlist" className="btn mt-6 bg-white text-slate-950 hover:bg-slate-100"><Heart size={16} /> View wishlist</Link></div>
          </section>
        </main>
      </div>
    </div>
  );
}
