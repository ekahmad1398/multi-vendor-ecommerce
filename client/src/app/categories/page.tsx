"use client";

import { CategoryGrid } from "@/components/products/catalog";
import { getCategories } from "@/services/catalog";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, PageHeader } from "@/components/ui/primitives";

export default function Categories() {
  const query = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  return (
    <div className="shell py-12">
      <PageHeader eyebrow="Shop by category" title="Find your corner" description="Browse the catalogue around the ways you actually live." />
      <div className="mt-10">
        {query.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="h-40 animate-pulse rounded-2xl bg-slate-200" key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.data?.length ? (
          <CategoryGrid categories={query.data} />
        ) : (
          <p className="text-slate-500">Categories will appear here once the store is stocked.</p>
        )}
      </div>
    </div>
  );
}
