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

export const login = async (email: string, password: string) =>
  (await api.post<{ message: string; user: BackendUser }>("/auth/login", { email, password })).data;

export const register = async (name: string, email: string, password: string) =>
  (await api.post<{ message: string }>("/auth/register", { name, email, password })).data;

export const verifyEmail = async (email: string, otp: string) =>
  (await api.post<{ message: string }>("/auth/verify-email", { email, otp })).data;

export const resendOtp = async (email: string) =>
  (await api.post<{ message: string }>("/auth/resend-otp", { email })).data;

export const logout = async () => { await api.post("/auth/logout"); };
