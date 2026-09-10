"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clearCart, getCart, removeCartItem, updateCartItem } from "@/services/cart";
import { Button, ErrorState, EmptyState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { money, productImage } from "@/lib/format";

export function CartPanel() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const sync = () => client.invalidateQueries({ queryKey: ["cart"] });
  const update = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => updateCartItem(id, quantity),
    onSuccess: sync,
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      sync();
      toast.success("Removed from bag");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      sync();
      toast.success("Bag cleared");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <div className="card h-64 animate-pulse bg-stone-100" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;
  const cart = query.data.cart;
  if (!cart.items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Browse the collection to find something worth bringing home."
        action={
          <Link href="/products" className="btn btn-dark">
            Shop products
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 p-5">
          <h2 className="font-serif text-2xl">
            Your items <span className="text-base text-slate-500">({cart.items.length})</span>
          </h2>
          <Button loading={clear.isPending} onClick={() => clear.mutate()} className="btn-light">
            Clear bag
          </Button>
        </div>
        {cart.items.map((item) => {
          const product = item.product;
          const image = productImage(product);
          return (
            <div key={product._id} className="flex gap-4 border-b border-stone-100 p-5">
              <div className="grid h-24 w-22 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-100">
                {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : "M"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500">{product.brand || product.category?.name}</p>
                <Link href={`/products/${product._id}`} className="font-medium">
                  {product.name}
                </Link>
                <p className="mt-1 font-medium">{money(item.unitPrice)}</p>
                {!item.available && <p className="mt-1 text-xs text-rose-600">This quantity is no longer available.</p>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-stone-300">
                    <button
                      aria-label="Decrease quantity"
                      disabled={item.quantity === 1 || update.isPending}
                      onClick={() => update.mutate({ id: product._id, quantity: item.quantity - 1 })}
                      className="p-2"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={item.quantity >= product.stock || update.isPending}
                      onClick={() => update.mutate({ id: product._id, quantity: item.quantity + 1 })}
                      className="p-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => remove.mutate(product._id)} className="flex items-center gap-1 text-sm text-rose-600">
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
      <aside className="card h-fit p-6">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd>{money(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Discount</dt>
            <dd className="text-emerald-700">-{money(cart.discount)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-semibold">
            <dt>Total</dt>
            <dd>{money(cart.total)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn btn-dark mt-7 w-full">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
