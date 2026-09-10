import { api } from "@/lib/api/axios";
import type { Product } from "@/types";

export const getWishlist = async () =>
  (await api.get<{ wishlist: { products: Product[] } }>("/wishlist")).data;
export const addToWishlist = async (productId: string) =>
  (await api.post(`/wishlist/${productId}`)).data;
export const removeFromWishlist = async (productId: string) =>
  (await api.delete(`/wishlist/${productId}`)).data;
