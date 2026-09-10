import axios from "axios";

// Service paths below are relative (for example, "/products"), so this URL
// deliberately includes the API prefix exactly once.
const fallbackApiUrl = process.env.NODE_ENV === "production"
  ? "https://multi-vendor-ecommerce-server-2sh9.onrender.com/api"
  : "http://localhost:30001/api";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl).replace(/\/+$/, "");

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
