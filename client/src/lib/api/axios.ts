import axios from "axios";

// The HTTP-only cookie is the persistent browser session. Keep a copy of a
// newly-issued token only in memory as a fallback for the current page session:
// it lets the request immediately following login authenticate even if a
// browser delays or blocks a cross-site cookie.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const api = axios.create({
  // `next.config.ts` proxies this same-origin path to the configured backend.
  // That keeps the httpOnly Local Auth cookie first-party in every browser.
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message ?? "Something went wrong. Please try again.")),
);
