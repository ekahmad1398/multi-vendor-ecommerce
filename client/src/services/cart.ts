import { api } from "@/lib/api/axios";
import type { Cart } from "@/types";

export const getCart = async () => (await api.get<{ cart: Cart }>("/cart")).data;
export const addCartItem = async (productId: string, quantity: number) =>
  (await api.post("/cart/items", { productId, quantity })).data;
export const updateCartItem = async (productId: string, quantity: number) =>
  (await api.put(`/cart/items/${productId}`, { quantity })).data;
export const removeCartItem = async (productId: string) =>
  (await api.delete(`/cart/items/${productId}`)).data;
export const clearCart = async () => (await api.delete("/cart")).data;
