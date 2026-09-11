"use client";

import { useQuery } from "@tanstack/react-query";
import { getSellerDashboard } from "@/services/seller";
import { ErrorState } from "@/components/ui/primitives";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { money } from "@/lib/format";
import Link from "next/link";

export default function SellerDashboard() {
  const query = useQuery({ queryKey: ["seller-dashboard"], queryFn: getSellerDashboard });
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Seller dashboard</p>
          <h1 className="mt-2 font-serif text-5xl">Your store</h1>
          <p className="mt-2 text-slate-500">Revenue counts paid or delivered line items only.</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-dark">
          Add product
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
            <article key={label} className="dashboard-card">
            <Icon className="text-amber-700" size={20} />
            <p className="mt-7 text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-serif text-3xl">{String(value)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
