import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:30001/api",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message ?? "Something went wrong. Please try again.")),
);
