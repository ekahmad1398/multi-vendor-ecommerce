"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, Package, ShoppingCart, Users } from "lucide-react";
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Store control centre</p>
          <h1 className="mt-2 font-serif text-5xl">Overview</h1>
          <p className="mt-2 text-slate-500">Live store performance and recent order activity.</p>
        </div>
        <Link href="/admin/products" className="btn btn-dark">
          Manage catalogue
        </Link>
      </header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <article key={label} className="dashboard-card">
            <Icon className="text-amber-700" size={20} />
            <p className="mt-7 text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-serif text-3xl">{String(value)}</p>
          </article>
        ))}
      </section>
      <p className="mt-4 text-sm text-slate-500">Average order value {money(data.averageOrderValue || 0)}</p>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Catalogue demand</p>
              <h2 className="mt-2 font-serif text-2xl">Best sellers</h2>
            </div>
            <Link href="/admin/products" className="text-link">
              Products
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {data.bestSellingProducts.length ? (
              data.bestSellingProducts.map((item, index) => (
                <div className="flex items-center gap-4" key={item.productId}>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-sm font-bold text-amber-800">
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
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-amber-600"
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
              <div key={item.category} className="rounded-xl border border-stone-200 p-4">
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
            View all
          </Link>
        </div>
        {orders.isLoading ? (
          <div className="h-32 animate-pulse bg-stone-50" />
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
