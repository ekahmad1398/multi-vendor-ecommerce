import Link from "next/link";
import { ArrowUpRight, Headphones, Mail, ShieldCheck, Truck } from "lucide-react";

const linkGroups = [
  ["Browse", [["All products", "/products"], ["New arrivals", "/products?sort=newest"], ["Categories", "/categories"]]],
  ["Account", [["Your profile", "/profile"], ["Orders", "/orders"], ["Wishlist", "/wishlist"]]],
  ["For vendors", [["Vendor studio", "/seller"], ["Your products", "/seller/products"], ["Start selling", "/seller/profile"]]],
] as const;

export function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white text-slate-700">
      <div className="shell py-7 sm:py-10">
        <section className="grid overflow-hidden rounded-2xl bg-slate-950 text-white lg:grid-cols-[1.3fr_.7fr]">
          <div className="relative overflow-hidden p-7 sm:p-9"><div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-500/40 blur-2xl" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">Morrow marketplace</p><h2 className="mt-3 max-w-xl font-serif text-4xl leading-none tracking-[-.045em] sm:text-5xl">Better finds for everyday living.</h2><p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Design-led objects from trusted independent sellers — all in one thoughtful marketplace.</p></div></div>
          <div className="flex flex-col justify-between border-t border-white/10 bg-white/5 p-7 sm:p-9 lg:border-l lg:border-t-0"><div><p className="text-sm font-semibold">Start exploring today.</p><p className="mt-2 text-sm leading-6 text-slate-300">New arrivals and useful pieces are added every week.</p></div><Link href="/products" className="btn mt-7 w-fit bg-teal-300 text-slate-950 hover:bg-teal-200">Explore the shop <ArrowUpRight size={17} /></Link></div>
        </section>
        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,.7fr)]">
          <div><Link href="/" className="font-serif text-4xl tracking-[-.07em] text-slate-950">morrow<span className="text-violet-600">.</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">A thoughtful multi-vendor marketplace for objects made with purpose.</p><a href="mailto:hello@morrow.store" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"><Mail size={16} /> hello@morrow.store</a></div>
          {linkGroups.map(([title, links]) => <div key={title}><h3 className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{title}</h3><div className="mt-4 flex flex-col gap-3">{links.map(([label, href]) => <Link className="w-fit text-sm font-medium text-slate-600 hover:text-violet-700" key={label} href={href}>{label}</Link>)}</div></div>)}
        </div>
        <div className="grid gap-3 border-y border-slate-200 py-5 text-sm sm:grid-cols-3"><p className="flex items-center gap-2"><Truck size={17} className="text-violet-600" /> Fast, thoughtful delivery</p><p className="flex items-center gap-2"><ShieldCheck size={17} className="text-violet-600" /> Secure checkout</p><p className="flex items-center gap-2 sm:justify-self-end"><Headphones size={17} className="text-violet-600" /> Support when you need it</p></div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-slate-400"><span>© 2026 Morrow. All rights reserved.</span><span>Made for good things, every day.</span></div>
      </div>
    </footer>
  );
}
