"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CircleDollarSign, FolderTree, Package, ShoppingCart, Store, Users } from "lucide-react";
import { getAdminOrders, getAdminStats } from "@/services/admin";
import { ErrorState } from "@/components/ui/primitives";
import { money, orderCode } from "@/lib/format";

type Stats = {
  totals: { totalOrders: number; totalSales: number };
  totalUsers: number;
  totalProducts: number;
  averageOrderValue: number;
  ordersByStatus: { status: string; count: number }[];
  bestSellingProducts: { productId: string; name: string; unitsSold: number; sales: number }[];
  salesByCategory: { category: string; sales: number }[];
};

export default function Admin() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: getAdminStats });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => getAdminOrders() });

  if (stats.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }
  if (stats.isError || !stats.data) return <ErrorState onRetry={() => stats.refetch()} />;

  const data = stats.data as Stats;
  const cards = [
    [CircleDollarSign, "Sales", money(data.totals.totalSales)],
    [ShoppingCart, "Orders", data.totals.totalOrders],
    [Users, "Customers", data.totalUsers],
    [Package, "Products", data.totalProducts],
  ] as const;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-7">
        <div>
          <p className="eyebrow">Store control centre</p>
          <h1 className="mt-2 font-serif text-5xl">Store overview.</h1>
          <p className="mt-3 text-slate-500">Live store performance and recent order activity.</p>
        </div>
        <Link href="/admin/products" className="btn btn-dark">
          Manage catalogue
        </Link>
      </header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <article key={label} className="dashboard-card transition hover:border-violet-300 hover:shadow-md">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon size={20} /></span>
            <p className="mt-6 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 font-serif text-3xl text-slate-950">{String(value)}</p>
          </article>
        ))}
      </section>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><p>Average order value {money(data.averageOrderValue || 0)}</p><div className="flex gap-2"><Link href="/admin/categories" className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"><FolderTree size={15} /> Categories</Link><span className="text-slate-300">·</span><Link href="/admin/sellers" className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"><Store size={15} /> Vendors</Link></div></div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Catalogue demand</p>
              <h2 className="mt-2 font-serif text-2xl">Best sellers</h2>
            </div>
            <Link href="/admin/products" className="text-link">
              Products <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {data.bestSellingProducts.length ? (
              data.bestSellingProducts.map((item, index) => (
                <div className="flex items-center gap-4" key={item.productId}>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-50 text-sm font-bold text-violet-800">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.unitsSold} units sold</p>
                  </div>
                  <p className="font-medium">{money(item.sales)}</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-sm text-slate-500">Sales data will appear after paid or delivered orders.</p>
            )}
          </div>
        </div>
        <div className="card p-6">
          <p className="eyebrow">Fulfilment</p>
          <h2 className="mt-2 font-serif text-2xl">Order status</h2>
          <div className="mt-6 space-y-4">
            {data.ordersByStatus.length ? (
              data.ordersByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${Math.max(8, (item.count / Math.max(data.totals.totalOrders, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
        </div>
      </section>
      {data.salesByCategory?.length > 0 && (
        <section className="card mt-6 p-6">
          <p className="eyebrow">Mix</p>
          <h2 className="mt-2 font-serif text-2xl">Sales by category</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.salesByCategory.map((item) => (
              <div key={item.category} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{item.category}</p>
                <p className="mt-1 font-medium">{money(item.sales)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="eyebrow">Live activity</p>
            <h2 className="mt-2 font-serif text-2xl">Recent orders</h2>
          </div>
          <Link href="/admin/orders" className="text-link">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
        {orders.isLoading ? (
          <div className="h-32 animate-pulse bg-slate-50" />
        ) : (
          <div className="table-wrap rounded-none border-x-0 border-b-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.data?.orders?.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="font-medium">{orderCode(order._id)}</td>
                    <td>{order.user?.name || "Customer"}</td>
                    <td className="capitalize">{order.status}</td>
                    <td className="text-right font-medium">{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
