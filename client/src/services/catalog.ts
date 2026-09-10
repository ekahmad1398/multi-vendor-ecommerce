import { api } from "@/lib/api/axios";
import type { Category, Product } from "@/types";

export const getProducts = async (params?: Record<string, string>) =>
  (
    await api.get<{
      products: Product[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>("/products", {
      params: Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== "")),
    })
  ).data;

export const getProduct = async (id: string) =>
  (await api.get<{ product: Product }>(`/products/${id}`)).data.product;

export const getCategories = async () =>
  (await api.get<{ categories: Category[] }>("/categories")).data.categories;

export const deleteProduct = async (id: string) =>
  (await api.delete(`/products/${id}`)).data;
