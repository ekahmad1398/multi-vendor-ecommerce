import Review from "../models/Review.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const updateRating = async (productId) => {
  const [result] = await Review.aggregate([{ $match: { product: productId } }, { $group: { _id: null, rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }]);
  await Product.findByIdAndUpdate(productId, { rating: result ? Number(result.rating.toFixed(2)) : 0, reviewCount: result?.reviewCount || 0 });
};
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate("user", "name").sort("-createdAt");
  res.json({ reviews });
});
export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw new AppError("Active product not found", 404);
  if (!Number.isInteger(Number(req.body.rating)) || Number(req.body.rating) < 1 || Number(req.body.rating) > 5) throw new AppError("Rating must be a whole number from 1 to 5");
  const review = await Review.create({ user: req.user._id, product: product._id, rating: Number(req.body.rating), comment: req.body.comment });
  await updateRating(product._id);
  await review.populate("user", "name");
  res.status(201).json({ review });
});
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Review not found", 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") throw new AppError("You cannot edit this review", 403);
  if (req.body.rating !== undefined && (!Number.isInteger(Number(req.body.rating)) || Number(req.body.rating) < 1 || Number(req.body.rating) > 5)) throw new AppError("Rating must be a whole number from 1 to 5");
  if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save(); await updateRating(review.product); res.json({ review });
});
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Review not found", 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") throw new AppError("You cannot delete this review", 403);
  await review.deleteOne(); await updateRating(review.product); res.json({ message: "Review deleted" });
});
