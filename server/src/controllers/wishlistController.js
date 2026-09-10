import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const populate = (user) => Wishlist.findOne({ user }).populate("products", "name price discount stock images image rating isActive");
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await populate(req.user._id);
  res.json({ wishlist: wishlist || { user: req.user._id, products: [] } });
});
export const addWishlistProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw new AppError("Active product not found", 404);
  const wishlist = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $addToSet: { products: product._id } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await wishlist.populate("products", "name price discount stock images image rating isActive");
  res.status(201).json({ wishlist });
});
export const removeWishlistProduct = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $pull: { products: req.params.productId } }, { new: true });
  if (!wishlist) throw new AppError("Wishlist product not found", 404);
  await wishlist.populate("products", "name price discount stock images image rating isActive");
  res.json({ wishlist });
});
