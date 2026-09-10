"use client";

import { ProductGrid } from "@/components/products/catalog";
import { getWishlist } from "@/services/wishlist";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/primitives";
import Link from "next/link";

export default function Wishlist() {
  const query = useQuery({ queryKey: ["wishlist"], queryFn: getWishlist });

  return (
    <div className="shell py-12">
      <PageHeader eyebrow="Saved for later" title="Your wishlist" description="Your personal edit of pieces worth returning to." />
      <div className="mt-8">
        {query.isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
        ) : query.isError || !query.data ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.data.wishlist.products.length ? (
          <ProductGrid products={query.data.wishlist.products} />
        ) : (
          <EmptyState
            title="Nothing saved yet"
            description="Save products you love and they will appear here."
            action={
              <Link href="/products" className="btn btn-dark">
                Explore products
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
