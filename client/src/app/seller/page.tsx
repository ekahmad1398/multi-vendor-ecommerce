"use client";

import { useQuery } from "@tanstack/react-query";
import { getSellerDashboard, getSellerOrders } from "@/services/seller";
import { Badge, ErrorState } from "@/components/ui/primitives";
import { ArrowUpRight, DollarSign, Package, Plus, ShoppingCart } from "lucide-react";
import { money, orderCode } from "@/lib/format";
import { statusTone } from "@/lib/status";
import Link from "next/link";

export default function SellerDashboard() {
  const query = useQuery({ queryKey: ["seller-dashboard"], queryFn: getSellerDashboard });
  const orders = useQuery({ queryKey: ["seller-orders"], queryFn: getSellerOrders });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  const cards = [
    [DollarSign, "Revenue", money(query.data.revenue)],
    [ShoppingCart, "Orders", query.data.totalOrders],
    [Package, "Products", query.data.totalProducts],
    [Package, "Units sold", query.data.unitsSold],
  ] as const;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-7">
        <div>
          <p className="eyebrow">Vendor dashboard</p>
          <h1 className="mt-2 font-serif text-5xl">Your store, at a glance.</h1>
          <p className="mt-3 text-slate-500">Revenue counts paid or delivered line items only.</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-dark">
          <Plus size={17} /> Add product
        </Link>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
            <article key={label} className="dashboard-card transition hover:border-violet-300 hover:shadow-md">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon size={20} /></span>
            <p className="mt-6 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 font-serif text-3xl text-slate-950">{String(value)}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-6"><div><p className="eyebrow">Live activity</p><h2 className="mt-2 font-serif text-3xl">Recent orders</h2></div><Link href="/seller/orders" className="text-link">View all <ArrowUpRight size={16} /></Link></div>
          {orders.isLoading ? <div className="h-40 animate-pulse bg-slate-50" /> : orders.data?.orders?.length ? <div className="divide-y divide-slate-100">{orders.data.orders.slice(0, 4).map((order: { _id: string; user?: { name?: string }; items: { status: string; subtotal: number }[] }) => <Link href="/seller/orders" key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">#{orderCode(order._id).slice(-3)}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{order.user?.name || "Customer"}</p><p className="mt-0.5 text-sm text-slate-500">{orderCode(order._id)}</p></div><div className="text-right"><Badge tone={statusTone(order.items[0]?.status || "pending")}>{order.items[0]?.status || "pending"}</Badge><p className="mt-1 text-sm font-semibold">{money(order.items.reduce((total, item) => total + item.subtotal, 0))}</p></div></Link>)}</div> : <div className="p-6 text-sm text-slate-500">Orders containing your products will appear here.</div>}
        </div>
        <div className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-300">Quick actions</p><h2 className="mt-3 font-serif text-3xl leading-none">Keep your shop moving.</h2><div className="mt-6 space-y-3"><Link href="/seller/products/new" className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-semibold hover:bg-white/15">Add a new product <ArrowUpRight size={17} /></Link><Link href="/seller/products" className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-semibold hover:bg-white/15">Manage inventory <ArrowUpRight size={17} /></Link><Link href="/seller/profile" className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-semibold hover:bg-white/15">Store profile <ArrowUpRight size={17} /></Link></div></div>
      </section>
    </>
  );
}
