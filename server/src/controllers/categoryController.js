import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => res.json({ categories: await Category.find().sort("name") }));
export const createCategory = asyncHandler(async (req, res) => res.status(201).json({ category: await Category.create(req.body) }));
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ category });
});
export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) throw new AppError("Cannot delete a category that still has products", 400);
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found", 404);
  res.json({ message: "Category deleted" });
});
