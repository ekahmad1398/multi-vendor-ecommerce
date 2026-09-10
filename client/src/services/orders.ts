import { api } from "@/lib/api/axios";
import type { Order } from "@/types";

export const getOrders = async () => (await api.get<{ orders: Order[] }>("/orders/my")).data;
export const getOrder = async (id: string) => (await api.get<{ order: Order }>(`/orders/my/${id}`)).data;
export const cancelOrder = async (id: string) => (await api.patch(`/orders/my/${id}/cancel`)).data;
export const createOrder = async (shippingAddress: object, paymentMethod?: string) =>
  (await api.post<{ order: Order }>("/orders", { shippingAddress, paymentMethod })).data;
