import Link from "next/link";
import { ArrowUpRight, Globe2, Heart, Mail, ShieldCheck, Truck } from "lucide-react";

export function Footer() {
  const blocks = [
    ["Shop", [["All products", "/products"], ["Categories", "/categories"], ["Wishlist", "/wishlist"]]],
    ["Account", [["Your profile", "/profile"], ["Orders", "/orders"], ["Sign in", "/sign-in"]]],
    ["For sellers", [["Seller dashboard", "/seller"], ["Seller profile", "/seller/profile"], ["Add a product", "/seller/products/new"]]],
  ] as const;

  return (
    <footer className="border-t border-stone-200 bg-[#f1eee8]">
      <div className="shell py-12 sm:py-16">
        <div className="grid gap-8 rounded-[1.5rem] bg-[#172033] px-6 py-8 text-white shadow-[0_18px_45px_rgba(23,32,51,0.16)] sm:px-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-lime-300">The considered edit</p>
            <h2 className="mt-3 max-w-lg font-serif text-4xl leading-none tracking-[-0.04em] sm:text-5xl">Good things, gathered carefully.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Useful, beautiful objects for everyday living, sourced from independent sellers.</p>
          </div>
          <Link href="/products" className="btn w-fit bg-lime-300 text-slate-950 hover:bg-lime-200">Explore the shop <ArrowUpRight size={17} /></Link>
        </div>
        <div className="grid gap-10 border-b border-stone-200 py-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,.7fr)]">
          <div>
            <Link href="/" className="font-serif text-3xl tracking-[-0.07em] text-slate-950">morrow<span className="text-amber-700">.</span></Link>
            <p className="mt-3 max-w-52 text-sm leading-6 text-slate-500">A warmer way to discover pieces that earn their place.</p>
            <Link href="mailto:hello@morrow.store" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-amber-800"><Mail size={15} /> hello@morrow.store</Link>
          </div>
        {blocks.map(([title, items]) => (
          <div key={title}>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-800">{title}</h3>
            <div className="mt-3 flex flex-col gap-2">
              {items.map(([label, href]) => (
                <Link className="w-fit text-sm text-slate-500 hover:translate-x-1 hover:text-slate-900" key={label} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        </div>
        <div className="grid gap-4 py-7 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-2"><Truck size={17} className="text-amber-700" /> Thoughtful delivery</div>
          <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-amber-700" /> Secure checkout</div>
          <div className="flex items-center gap-2"><Heart size={17} className="text-amber-700" /> Independent makers</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5 text-xs text-slate-500">
          <span>© 2026 Morrow. All rights reserved.</span>
          <Link aria-label="Morrow social profile" href="https://instagram.com" className="inline-flex items-center gap-2 hover:text-slate-900"><Globe2 size={15} /> Social</Link>
        </div>
      </div>
    </footer>
  );
}
