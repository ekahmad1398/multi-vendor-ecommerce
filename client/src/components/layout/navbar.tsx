"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import type { RootState } from "@/store";
import { useLocalAuth } from "@/components/auth/local-auth-provider";
import { toast } from "sonner";

const links = [["Shop", "/products"], ["Categories", "/categories"], ["New arrivals", "/products?sort=newest"]] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const count = useSelector((state: RootState) => state.cart.itemCount);
  const { isSignedIn, signOut } = useLocalAuth();
  const { signOut: clerkSignOut } = useClerk();
  const queryClient = useQueryClient();
  const router = useRouter();
  const path = usePathname();
  const close = () => setOpen(false);
  const handleSignOut = async () => { await signOut(); await clerkSignOut(); queryClient.clear(); toast.success("Signed out successfully"); close(); router.push("/"); };
  const isActive = (href: string) => href === "/products" ? path.startsWith("/products") : path === href;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgb(15_23_42_/_0.02)] backdrop-blur-xl">
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="shell flex h-8 items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[.11em] text-slate-500">
          <span>Free shipping on qualifying orders</span>
          <span className="hidden sm:block">Independent makers. Useful objects.</span>
        </div>
      </div>
      <div className="shell flex min-h-[4.5rem] items-center gap-3 sm:gap-5">
        <Link href="/" className="shrink-0" onClick={close}>
          <span className="block font-serif text-3xl leading-none tracking-[-.07em] text-slate-950">morrow<span className="text-violet-600">.</span></span>
        </Link>
        <form action="/products" className="desktop-only relative mx-auto w-full max-w-xl">
          <label htmlFor="store-search" className="sr-only">Search products</label>
          <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input id="store-search" name="keyword" placeholder="Search products, brands and makers" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100" />
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Link aria-label="Search products" href="/products" className="icon mobile-only"><Search size={19} /></Link>
          <Link aria-label="Wishlist" href="/wishlist" className="icon hidden sm:grid"><Heart size={19} /></Link>
          {isSignedIn && <Link href="/dashboard" aria-label="Dashboard" className="icon hidden text-violet-700 sm:grid"><LayoutDashboard size={18} /></Link>}
          {!isSignedIn ? <div className="hidden items-center gap-1 sm:flex"><Link href="/sign-in" className="px-2 py-2 text-sm font-semibold text-slate-700 hover:text-violet-700">Sign in</Link><Link href="/sign-up" className="btn btn-dark px-3.5 py-2">Create account</Link></div> : <div className="hidden items-center gap-1 sm:flex"><Link href="/profile" aria-label="My account" className="icon bg-violet-50 text-violet-700"><UserRound size={18} /></Link><button aria-label="Sign out" onClick={handleSignOut} className="icon"><LogOut size={18} /></button></div>}
          <Link aria-label="Cart" href="/cart" className="icon relative"><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">{count}</span>}</Link>
          <button aria-label="Menu" className="icon mobile-only" onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      <div className="hidden border-t border-slate-100 md:block">
        <div className="shell flex h-10 items-center gap-7">
          <Link href="/categories" className="text-xs font-bold uppercase tracking-[.08em] text-slate-700 hover:text-violet-700">All categories</Link>
          <nav aria-label="Main navigation" className="flex items-center gap-6">
            {links.map(([label, href]) => <Link key={href} href={href} className={`text-sm font-semibold ${isActive(href) ? "text-violet-700" : "text-slate-500 hover:text-slate-950"}`}>{label}</Link>)}
          </nav>
          <span className="ml-auto text-xs font-medium text-slate-400">Curated objects from independent sellers</span>
        </div>
      </div>
      {open && <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-3 py-3 md:hidden"><div className="shell flex flex-col gap-1">{[["Home", "/"], ...links].map(([label, href]) => <Link className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive(href) ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"}`} href={href} onClick={close} key={href}>{label}</Link>)}<div className="my-2 border-t border-slate-100" />{isSignedIn && <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/profile" onClick={close}>My account</Link>}{!isSignedIn ? <><Link className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/sign-in" onClick={close}>Sign in</Link><Link className="btn btn-dark mt-1" href="/sign-up" onClick={close}>Create account</Link></> : <button onClick={handleSignOut} className="flex items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><LogOut size={16} className="mr-2" />Sign out</button>}</div></nav>}
    </header>
  );
}
