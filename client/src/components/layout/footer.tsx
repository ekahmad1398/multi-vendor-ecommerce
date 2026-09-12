import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck, Truck } from "lucide-react";

const linkGroups = [
  ["Browse", [["All products", "/products"], ["New arrivals", "/products?sort=newest"], ["Categories", "/categories"]]],
  ["Account", [["Your profile", "/profile"], ["Orders", "/orders"], ["Wishlist", "/wishlist"]]],
  ["For vendors", [["Vendor studio", "/seller"], ["Your products", "/seller/products"], ["Start selling", "/seller/profile"]]],
] as const;

export function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white text-slate-700">
      <div className="shell py-8 sm:py-12">
        <section className="grid overflow-hidden rounded-2xl bg-slate-950 text-white lg:grid-cols-[1.25fr_.75fr]">
          <div className="p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">Morrow marketplace</p><h2 className="mt-3 max-w-xl font-serif text-4xl leading-none tracking-[-.045em] sm:text-5xl">Objects that make everyday life feel considered.</h2></div>
          <div className="flex flex-col justify-between border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0"><p className="max-w-xs text-sm leading-6 text-slate-300">Discover independent sellers, useful design, and goods chosen to last.</p><Link href="/products" className="btn mt-7 w-fit bg-teal-300 text-slate-950 hover:bg-teal-200">Explore the shop <ArrowUpRight size={17} /></Link></div>
        </section>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,.7fr)]">
          <div><Link href="/" className="font-serif text-4xl tracking-[-.07em] text-slate-950">morrow<span className="text-violet-600">.</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">A thoughtful multi-vendor marketplace for objects made with purpose.</p><a href="mailto:hello@morrow.store" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"><Mail size={16} /> hello@morrow.store</a></div>
          {linkGroups.map(([title, links]) => <div key={title}><h3 className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{title}</h3><div className="mt-4 flex flex-col gap-3">{links.map(([label, href]) => <Link className="w-fit text-sm font-medium text-slate-600 hover:text-violet-700" key={label} href={href}>{label}</Link>)}</div></div>)}
        </div>
        <div className="grid gap-4 border-y border-slate-200 py-5 text-sm sm:grid-cols-2"><p className="flex items-center gap-2"><Truck size={17} className="text-violet-600" /> Thoughtful delivery from independent sellers</p><p className="flex items-center gap-2 sm:justify-self-end"><ShieldCheck size={17} className="text-violet-600" /> Secure checkout and protected accounts</p></div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-slate-400"><span>© 2026 Morrow. All rights reserved.</span><span>Made for good things, every day.</span></div>
      </div>
    </footer>
  );
}
