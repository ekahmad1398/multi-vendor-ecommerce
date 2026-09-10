import { Suspense } from "react";
import { ProductsCatalog } from "@/components/products/products-catalog";
import { ProductSkeleton } from "@/components/ui/product-skeleton";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-14">
          <div className="h-10 w-72 animate-pulse rounded bg-stone-200" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
