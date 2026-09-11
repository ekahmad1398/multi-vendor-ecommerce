import Link from "next/link";
import { ArrowUpRight, Heart, Mail, ShieldCheck, Sparkles, Truck } from "lucide-react";

const blocks = [
  ["Shop", [["All products", "/products"], ["Categories", "/categories"], ["Saved pieces", "/wishlist"]]],
  ["Your account", [["Profile", "/profile"], ["Orders", "/orders"], ["Sign in", "/sign-in"]]],
  ["Sell with us", [["Seller studio", "/seller"], ["Your products", "/seller/products"], ["Start selling", "/seller/profile"]]],
] as const;

export function Footer() {
  return <footer className="mt-10 bg-slate-950 text-white">
    <div className="shell py-10 sm:py-14"><section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-violet-600 px-6 py-9 sm:px-10 lg:grid lg:grid-cols-[1.25fr_.75fr] lg:items-end"><div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#2dd4bf] opacity-25 blur-3xl" /><div className="relative"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#99f6e4]"><Sparkles size={14} /> Made for the everyday</p><h2 className="mt-4 max-w-xl font-serif text-4xl leading-none tracking-[-.05em] sm:text-5xl">Find your next favourite thing.</h2><p className="mt-4 max-w-md text-sm leading-6 text-violet-100">Discover thoughtful objects from independent sellers with a point of view.</p></div><Link href="/products" className="btn relative mt-7 w-fit bg-[#2dd4bf] text-slate-950 hover:bg-[#99f6e4] lg:justify-self-end">Explore the marketplace <ArrowUpRight size={17} /></Link></section>
      <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,.7fr)]"><div><Link href="/" className="font-serif text-4xl tracking-[-.07em]">morrow<span className="text-[#2dd4bf]">.</span></Link><p className="mt-4 max-w-60 text-sm leading-6 text-slate-400">The marketplace for independent design and objects that earn their place.</p><Link href="mailto:hello@morrow.store" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#2dd4bf]"><Mail size={16} /> hello@morrow.store</Link></div>{blocks.map(([title, items]) => <div key={title}><h3 className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">{title}</h3><div className="mt-4 flex flex-col gap-3">{items.map(([label, href]) => <Link className="w-fit text-sm text-slate-200 hover:translate-x-1 hover:text-[#2dd4bf]" key={label} href={href}>{label}</Link>)}</div></div>)}</div>
      <div className="grid gap-5 border-b border-white/10 py-7 text-sm text-slate-300 sm:grid-cols-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-[#2dd4bf]"><Truck size={17} /></span>Thoughtful delivery</div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-[#2dd4bf]"><ShieldCheck size={17} /></span>Secure checkout</div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-[#2dd4bf]"><Heart size={17} /></span>Made with care</div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-slate-500"><span>© 2026 Morrow. All rights reserved.</span><span>Made for good things, every day.</span></div>
    </div>
  </footer>;
}
