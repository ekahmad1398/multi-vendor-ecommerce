"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import type { RootState } from "@/store";
import { useLocalAuth } from "@/components/auth/local-auth-provider";

const links = [["Shop", "/products"], ["Categories", "/categories"], ["New arrivals", "/products?sort=newest"]];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const count = useSelector((state: RootState) => state.cart.itemCount);
  const { user, isSignedIn, signOut } = useLocalAuth();
  const { signOut: clerkSignOut } = useClerk();
  const queryClient = useQueryClient(); const router = useRouter(); const path = usePathname();
  const close = () => setOpen(false);
  const handleSignOut = async () => { await signOut(); await clerkSignOut(); queryClient.clear(); close(); router.push("/"); };
  const seller = user?.role === "seller"; const admin = user?.role === "admin";
  const shopActive = path.startsWith("/products");

  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-xl">
    <div className="border-b border-slate-200/70 bg-slate-950 text-slate-300"><div className="shell flex h-8 items-center justify-between text-[10px] font-bold uppercase tracking-[.15em]"><span className="inline-flex items-center gap-2"><Sparkles size={12} className="text-[#2dd4bf]" /> Independent design, delivered</span><span className="hidden sm:block">Free delivery on qualifying orders</span></div></div>
    <div className="shell flex min-h-[4.9rem] items-center justify-between gap-4 py-2">
      <Link href="/" className="group shrink-0"><span className="block font-serif text-3xl leading-none tracking-[-.07em] text-slate-950">morrow<span className="text-violet-600">.</span></span><span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[.18em] text-slate-400 sm:block">Curated marketplace</span></Link>
      <nav className="desktop-only items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"><Link href="/" className={`nav-link rounded-lg px-3 py-2 ${path === "/" ? "is-active bg-slate-950 font-medium" : ""}`}>Home</Link>{links.map(([label, href]) => <Link key={href} href={href} className={`nav-link rounded-lg px-3 py-2 ${shopActive && href === "/products" ? "is-active bg-slate-950 font-medium" : ""}`}>{label}</Link>)}</nav>
      <div className="flex items-center gap-1"><Link aria-label="Search products" href="/products" className="icon"><Search size={19} /></Link><Link aria-label="Wishlist" href="/wishlist" className="icon"><Heart size={19} /></Link>{seller && <Link href="/seller" aria-label="Seller dashboard" className="icon hidden text-violet-700 sm:grid"><LayoutDashboard size={18} /></Link>}{admin && <Link href="/admin" aria-label="Admin dashboard" className="icon hidden text-violet-700 sm:grid"><LayoutDashboard size={18} /></Link>}{!isSignedIn ? <div className="hidden items-center gap-1 sm:flex"><Link href="/sign-in" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign in</Link><Link href="/sign-up" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Join Morrow</Link></div> : <div className="hidden items-center gap-1 sm:flex"><Link href="/profile" aria-label="My account" className="icon bg-violet-100 text-violet-800"><UserRound size={18} /></Link><button aria-label="Sign out" onClick={handleSignOut} className="icon"><LogOut size={18} /></button></div>}<Link aria-label="Cart" href="/cart" className="icon relative"><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[10px] text-white">{count}</span>}</Link><button aria-label="Menu" className="icon mobile-only" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
    {open && <nav className="shell flex flex-col gap-1 border-t border-slate-200 py-4 md:hidden"><Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/" onClick={close}>Home</Link>{links.map(([label, href]) => <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" onClick={close} key={href} href={href}>{label}</Link>)}<div className="my-2 border-t border-slate-200" />{isSignedIn && <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/profile" onClick={close}>My account</Link>}{seller && <Link className="rounded-xl px-3 py-2 font-semibold text-violet-700 hover:bg-violet-50" href="/seller" onClick={close}>Seller dashboard</Link>}{admin && <Link className="rounded-xl px-3 py-2 font-semibold text-violet-700 hover:bg-violet-50" href="/admin" onClick={close}>Admin dashboard</Link>}{!isSignedIn && <><Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/sign-in" onClick={close}>Sign in</Link><Link className="rounded-xl bg-slate-950 px-3 py-2 text-center font-semibold text-white" href="/sign-up" onClick={close}>Join Morrow</Link></>}{isSignedIn && <button onClick={handleSignOut} className="flex rounded-xl px-3 py-2 text-left hover:bg-slate-100"><LogOut size={16} /> <span className="ml-2">Sign out</span></button>}</nav>}
  </header>;
}
