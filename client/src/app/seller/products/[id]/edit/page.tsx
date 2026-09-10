"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSellerProducts } from "@/services/seller";
import { SellerProductForm } from "@/components/seller/product-form";
import { ErrorState } from "@/components/ui/primitives";
import type { Product } from "@/types";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["seller-products"], queryFn: getSellerProducts });
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  const product = query.data?.products.find((item: Product) => item._id === id);
  if (!product) return <ErrorState onRetry={() => query.refetch()} />;
  return (
    <>
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-serif text-5xl">Edit product</h1>
      <div className="mt-8">
        <SellerProductForm product={product} />
      </div>
    </>
  );
}
