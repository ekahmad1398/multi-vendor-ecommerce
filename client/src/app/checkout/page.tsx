"use client";

import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCart } from "@/services/cart";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/primitives";
import { money } from "@/lib/format";

export default function Checkout() {
  const query = useQuery({ queryKey: ["cart"], queryFn: getCart });
  if (query.isLoading) {
    return (
      <div className="shell py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return (
      <div className="shell py-12">
        <ErrorState onRetry={() => query.refetch()} />
      </div>
    );
  }
  const cart = query.data.cart;
  if (!cart.items.length) {
    return (
      <div className="shell py-12">
        <EmptyState
          title="Your bag is empty"
          description="Add an available item before checking out."
          action={
            <Link href="/products" className="btn btn-dark">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="shell py-10 sm:py-14">
      <PageHeader
        eyebrow="Secure checkout"
        title="A few final details"
        description="Your total is confirmed by the store when your order is placed."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <CheckoutForm />
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <div className="mt-5 max-h-72 space-y-4 overflow-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.product.name}</p>
                  <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 font-medium">{money(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{money(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Discount</dt>
              <dd className="text-emerald-700">-{money(cart.discount)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{money(cart.total)}</dd>
            </div>
          </dl>
          <Link href="/cart" className="text-link mt-6">
            Return to bag
          </Link>
        </aside>
      </div>
    </div>
  );
}
