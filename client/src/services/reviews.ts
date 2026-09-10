import { api } from "@/lib/api/axios";
import type { Review } from "@/types";

export const getReviews = async (productId: string) =>
  (await api.get<{ reviews: Review[] }>(`/products/${productId}/reviews`)).data.reviews;
export const createReview = async (productId: string, data: { rating: number; comment: string }) =>
  (await api.post(`/products/${productId}/reviews`, data)).data;
export const deleteReview = async (id: string) => (await api.delete(`/reviews/${id}`)).data;
