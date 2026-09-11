"use client";

import Link from "next/link";
import { getOrders } from "@/services/orders";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, Badge, PageHeader } from "@/components/ui/primitives";
import type { Order } from "@/types";
import { money, orderCode } from "@/lib/format";
import { statusTone } from "@/lib/status";

export default function Orders() {
  const query = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  return (
    <div className="shell py-12">
      <PageHeader eyebrow="Account" title="Your orders" description="Follow fulfilment, payments, and delivery details." />
      <div className="mt-8">
        {query.isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        ) : query.isError || !query.data ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !query.data.orders.length ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order, its progress will live here."
            action={
              <Link className="btn btn-dark" href="/products">
                Start shopping
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {query.data.orders.map((order: Order) => (
              <Link href={`/orders/${order._id}`} key={order._id} className="card flex flex-wrap items-center justify-between gap-4 p-5 hover:border-violet-300">
                <div>
                  <p className="font-medium">Order {orderCode(order._id)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 && "s"}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  <p className="font-medium">{money(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
