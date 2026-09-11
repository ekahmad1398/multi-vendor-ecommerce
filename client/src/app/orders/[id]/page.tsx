"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, getOrder } from "@/services/orders";
import { Badge, Button, ErrorState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { money, orderCode } from "@/lib/format";
import { statusTone } from "@/lib/status";

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id) });
  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["order", id] });
      client.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) {
    return (
      <div className="shell py-12">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
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

  const order = query.data.order;
  const canCancel = ["pending", "processing"].includes(order.status) && order.items.every((item) => ["pending", "processing"].includes(item.status || order.status));

  return (
    <div className="shell py-12">
      <Link href="/orders" className="text-link">
        ← All orders
      </Link>
      <div className="mt-6 flex flex-wrap justify-between gap-4">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="mt-2 font-serif text-4xl">{orderCode(order._id)}</h1>
          <p className="mt-2 text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="card divide-y divide-slate-100">
          {order.items.map((item) => (
            <div className="flex justify-between gap-4 p-5" key={item.product}>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">
                  Quantity {item.quantity}
                  {item.status && ` · ${item.status}`}
                </p>
              </div>
              <p>{money(item.subtotal)}</p>
            </div>
          ))}
        </section>
        <aside className="card h-fit p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{money(order.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Payment</dt>
              <dd className="capitalize">{order.paymentMethod.replaceAll("_", " ")}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
          <h3 className="mt-7 font-medium">Shipping address</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.country}
            {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}
            <br />
            {order.shippingAddress.phone}
          </p>
          {canCancel && (
            <Button loading={cancel.isPending} onClick={() => cancel.mutate()} className="btn-light mt-6 w-full">
              Cancel order
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
