import { api } from "@/lib/api/axios";
import type { Order } from "@/types";
import type { AppRole } from "@/services/auth";

export const getAdminStats = async () => (await api.get("/orders/admin/stats")).data;
export const getAdminOrders = async (params?: Record<string, string>) =>
  (await api.get<{ orders: AdminOrder[] }>("/orders", { params })).data;
export const updateOrderStatus = async (id: string, status: string, paymentStatus?: string) =>
  (await api.patch(`/orders/${id}/status`, { status, paymentStatus })).data;
export const createCategory = async (data: { name: string; description?: string }) =>
  (await api.post("/categories", data)).data;
export const updateCategory = async (id: string, data: { name: string; description?: string }) =>
  (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id: string) => (await api.delete(`/categories/${id}`)).data;

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: AppRole;
  sellerStatus?: "active" | "suspended";
  isEmailVerified: boolean;
  createdAt: string;
};

export type AdminOrder = Order & { user?: { name: string; email?: string } };

export const getAdminUsers = async (role?: AppRole) =>
  (await api.get<{ users: AdminUser[] }>("/admin/users", { params: role ? { role } : undefined })).data;

export const updateAdminUser = async (
  id: string,
  data: Partial<Pick<AdminUser, "role" | "sellerStatus">>,
) => (await api.patch(`/admin/users/${id}`, data)).data;
