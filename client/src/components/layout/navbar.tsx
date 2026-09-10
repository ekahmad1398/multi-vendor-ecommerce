"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getBackendProfile } from "@/services/auth";
import { usePathname } from "next/navigation";

const links = [
  ["Shop", "/products"],
  ["Categories", "/categories"],
  ["New arrivals", "/products?sort=newest"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const count = useSelector((s: RootState) => s.cart.itemCount);
  const { isSignedIn } = useUser();
  const path = usePathname();
  const backend = useQuery({
    queryKey: ["backend-profile"],
    queryFn: getBackendProfile,
    enabled: Boolean(isSignedIn),
    retry: false,
  });
  const admin = backend.data?.role === "admin";
  const seller = backend.data?.role === "seller";

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf7f2]/90 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-3xl tracking-[-0.07em] text-slate-950">
          morrow<span className="text-amber-700">.</span>
        </Link>
        <nav className="desktop-only items-center gap-7">
          <Link href="/" className={`nav-link ${path === "/" ? "is-active font-medium" : ""}`}>
            Home
          </Link>
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={`nav-link ${path.startsWith("/products") && href.startsWith("/products") && !href.includes("sort") ? "is-active font-medium" : ""}`}>
              {label}
            </Link>
          ))}
          {seller && (
            <Link href="/seller" className="text-sm font-medium text-amber-800">
              Seller
            </Link>
          )}
          {admin && (
            <Link href="/admin" className="text-sm font-medium text-amber-800">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-1">
          <Link aria-label="Search products" href="/products" className="icon">
            <Search size={19} />
          </Link>
          <Link aria-label="Wishlist" href="/wishlist" className="icon">
            <Heart size={19} />
          </Link>
          <Show when="signed-out">
            <div className="hidden items-center gap-1 sm:flex">
              <Link href="/sign-in" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-stone-200">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Sign up
              </Link>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </Show>
          <Link aria-label="Cart" href="/cart" className="icon relative">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-700 px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
          <button aria-label="Menu" className="icon mobile-only" onClick={() => setOpen(!open)}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="shell flex flex-col gap-4 border-t border-stone-200 py-5 md:hidden">
          <Link href="/" onClick={close}>Home</Link>
          {links.map(([label, href]) => (
            <Link onClick={close} key={href} href={href}>
              {label}
            </Link>
          ))}
          <Link href="/profile" onClick={close}>My account</Link>
          {!isSignedIn && (
            <>
              <Link href="/sign-in" onClick={close}>Sign in</Link>
              <Link href="/sign-up" onClick={close}>Sign up</Link>
            </>
          )}
          {seller && <Link href="/seller" onClick={close}>Seller</Link>}
          {admin && <Link href="/admin" onClick={close}>Admin</Link>}
        </nav>
      )}
    </header>
  );
}
