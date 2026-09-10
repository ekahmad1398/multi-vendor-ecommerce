import { api } from "@/lib/api/axios";

export type BackendUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  sellerStatus?: "active" | "suspended";
  isEmailVerified?: boolean;
};

export const getBackendProfile = async () =>
  (await api.get<{ user: BackendUser }>("/auth/profile")).data.user;
