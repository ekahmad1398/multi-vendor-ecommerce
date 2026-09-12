"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSellerOrders, updateSellerOrderItemStatus } from "@/services/seller";
import { ErrorState, EmptyState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { money, orderCode } from "@/lib/format";

type SellerOrder = {
  _id: string;
  createdAt: string;
  user: { name: string; email: string };
  shippingAddress: { fullName: string; address: string; city: string; country: string };
  items: { _id: string; name: string; quantity: number; subtotal: number; status: string }[];
};

export default function SellerOrders() {
  const query = useQuery({ queryKey: ["seller-orders"], queryFn: getSellerOrders });
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: string }) =>
      updateSellerOrderItemStatus(orderId, itemId, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["seller-orders"] });
      toast.success("Fulfilment status updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data.orders.length) {
    return <EmptyState title="No vendor orders yet" description="Orders containing your products will appear here." />;
  }

  return (
    <>
      <p className="eyebrow">Fulfilment</p>
      <h1 className="mt-2 font-serif text-5xl">My orders</h1>
      <div className="mt-8 space-y-4">
        {query.data.orders.map((order: SellerOrder) => (
          <article className="rounded-2xl bg-white p-6 shadow-sm" key={order._id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-medium">Order {orderCode(order._id)}</p>
                <p className="text-sm text-slate-500">
                  {order.user.name} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.country}
              </p>
            </div>
            <div className="mt-5 divide-y">
              {order.items.map((item) => (
                <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={item._id}>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {money(item.subtotal / item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p>{money(item.subtotal)}</p>
                    <select
                      aria-label={`Status for ${item.name}`}
                      value={item.status}
                      onChange={(event) => update.mutate({ orderId: order._id, itemId: item._id, status: event.target.value })}
                      disabled={item.status === "cancelled" || update.isPending}
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
