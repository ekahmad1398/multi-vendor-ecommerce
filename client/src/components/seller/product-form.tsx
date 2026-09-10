"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/services/catalog";
import { saveSellerProduct } from "@/services/seller";
import type { Product } from "@/types";
import { Button, ErrorState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SellerProductForm({ product }: { product?: Product }) {
  const cats = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const router = useRouter();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (form: FormData) => saveSellerProduct(form, product?._id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(product ? "Product updated" : "Product created");
      router.push("/seller/products");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (cats.isLoading) return <div className="h-80 animate-pulse rounded-2xl bg-white" />;
  if (cats.isError) return <ErrorState onRetry={() => cats.refetch()} />;

  return (
    <form
      className="card max-w-3xl p-6"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(new FormData(event.currentTarget));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Product name
          <input required name="name" defaultValue={product?.name} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          Category
          <select required name="category" defaultValue={product?.category?._id} className="input mt-2">
            <option value="">Select category</option>
            {cats.data?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Price
          <input required min="0" step="0.01" name="price" type="number" defaultValue={product?.price} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          Stock
          <input required min="0" name="stock" type="number" defaultValue={product?.stock} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          Brand
          <input name="brand" defaultValue={product?.brand} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          SKU
          <input name="sku" defaultValue={product?.sku} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          Discount (%)
          <input min="0" max="100" name="discount" type="number" defaultValue={product?.discount || 0} className="input mt-2" />
        </label>
        <label className="text-sm font-medium">
          Images
          <input accept="image/jpeg,image/png,image/webp,image/gif" multiple name="images" type="file" className="mt-2 block text-sm" />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Description
          <textarea name="description" defaultValue={product?.description} className="input mt-2 min-h-32" />
        </label>
      </div>
      <Button loading={save.isPending} className="btn-dark mt-6">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
