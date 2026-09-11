import axios from "axios";

// Service paths below are relative (for example, "/products"). Normalizing
// here prevents a Vercel environment value containing only the host from
// silently sending requests to non-existent root routes.
const fallbackApiUrl = process.env.NODE_ENV === "production"
  ? "https://multi-vendor-ecommerce-0k3w.onrender.com/api"
  : "http://localhost:30001/api";

const normalizeApiUrl = (value: string) => {
  const baseUrl = value.replace(/\/+$/, "");
  return new URL(baseUrl).pathname.replace(/\/+$/, "") === "/api" ? baseUrl : `${baseUrl}/api`;
};

const apiBaseUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl);

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message ?? "Something went wrong. Please try again.")),
);
