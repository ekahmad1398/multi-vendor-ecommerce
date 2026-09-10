"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/catalog";
import { ProductGrid } from "./catalog";
import { ErrorState, EmptyState } from "@/components/ui/primitives";
import { ProductSkeleton } from "@/components/ui/product-skeleton";

export function LiveProductGrid({
  params,
  onResult,
}: {
  params?: Record<string, string>;
  onResult?: (data: { total: number; totalPages: number }) => void;
}) {
  const query = useQuery({ queryKey: ["products", params], queryFn: () => getProducts(params) });

  useEffect(() => {
    if (query.data) onResult?.({ total: query.data.pagination.total, totalPages: query.data.pagination.totalPages });
  }, [onResult, query.data]);

  if (query.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data.products.length) {
    return <EmptyState title="No products found" description="Try adjusting your search or filters to discover more pieces." />;
  }
  return <ProductGrid products={query.data.products} />;
}
