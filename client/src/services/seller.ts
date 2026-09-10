import { api } from "@/lib/api/axios";
import type { Product } from "@/types";

export const getSellerDashboard = async () => (await api.get("/seller/dashboard")).data;
export const getSellerProducts = async () => (await api.get<{ products: Product[] }>("/seller/products")).data;
export const getSellerOrders = async () => (await api.get("/seller/orders")).data;
export const updateSellerOrderItemStatus = async (orderId: string, itemId: string, status: string) =>
  (await api.patch(`/seller/orders/${orderId}/items/${itemId}/status`, { status })).data;
export const getSellerProfile = async () => (await api.get("/seller/profile")).data;
export const updateSellerProfile = async (name: string) => (await api.patch("/seller/profile", { name })).data;
export const saveSellerProduct = async (data: FormData, id?: string) =>
  (
    await api({
      method: id ? "put" : "post",
      url: id ? `/seller/products/${id}` : "/seller/products",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
export const deleteSellerProduct = async (id: string) => (await api.delete(`/seller/products/${id}`)).data;
