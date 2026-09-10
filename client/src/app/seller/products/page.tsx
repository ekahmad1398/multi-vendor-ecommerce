"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSellerProduct, getSellerProducts } from "@/services/seller";
import { EmptyState, ErrorState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { money } from "@/lib/format";
import type { Product } from "@/types";

export default function SellerProducts() {
  const query = useQuery({ queryKey: ["seller-products"], queryFn: getSellerProducts });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: deleteSellerProduct,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Product deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-serif text-5xl">My products</h1>
        </div>
        <Link href="/seller/products/new" className="btn btn-dark">
          Add product
        </Link>
      </div>
      {!query.data.products.length ? (
        <div className="mt-8">
          <EmptyState
            title="No products yet"
            description="Create your first product to begin selling."
            action={
              <Link href="/seller/products/new" className="btn btn-dark">
                Add product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="table-wrap mt-8">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {query.data.products.map((product: Product) => (
                <tr key={product._id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{money(product.price)}</td>
                  <td>{product.stock}</td>
                  <td className="text-right">
                    <Link className="text-amber-800" href={`/seller/products/${product._id}/edit`}>
                      Edit
                    </Link>
                    <button onClick={() => remove.mutate(product._id)} className="ml-4 text-rose-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
