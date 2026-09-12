import { Readable } from "stream";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const number = (v, name, o = {}) => { const n = Number(v); if (!Number.isFinite(n) || n < (o.min ?? 0) || (o.integer && !Number.isInteger(n))) throw new AppError(`Invalid ${name}`); return n; };
const uploadImage = (file) => new Promise((resolve, reject) => Readable.from(file.buffer).pipe(cloudinary.uploader.upload_stream({ folder: "ecommerce/products", resource_type: "image" }, (e, r) => e ? reject(new AppError("Image upload failed", 502)) : resolve({ url: r.secure_url, publicId: r.public_id }))));
const removeCloudinary = (images = []) => Promise.all(images.filter((x) => x.publicId).map((x) => cloudinary.uploader.destroy(x.publicId, { resource_type: "image" }).catch(() => null)));
const body = (source) => {
  const data = {}; for (const key of ["name", "description", "brand", "sku", "category"]) if (source[key] !== undefined) data[key] = source[key];
  for (const key of ["price", "stock", "discount"]) if (source[key] !== undefined) data[key] = number(source[key], key, { integer: key === "stock" });
  if (data.discount > 100) throw new AppError("Discount cannot exceed 100");
  if (source.isActive !== undefined) { if (![true, false, "true", "false"].includes(source.isActive)) throw new AppError("isActive must be true or false"); data.isActive = source.isActive === true || source.isActive === "true"; }
  return data;
};
export const getProducts = asyncHandler(async (req, res) => {
  const { page: qPage = 1, limit: qLimit = 10, search, keyword, category, brand, minPrice, maxPrice, rating, stock, availability, isActive, sort = "newest" } = req.query;
  const page = number(qPage, "page", { min: 1, integer: true }), limit = number(qLimit, "limit", { min: 1, integer: true }); if (limit > 100) throw new AppError("Limit cannot exceed 100");
  const filter = {}; const term = search || keyword; if (term) { if (String(term).length > 100) throw new AppError("Invalid search"); filter.$text = { $search: term }; }
  if (category) filter.category = category; if (brand) filter.brand = new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  if (minPrice !== undefined || maxPrice !== undefined) { const lo = minPrice === undefined ? 0 : number(minPrice, "minPrice"), hi = maxPrice === undefined ? Infinity : number(maxPrice, "maxPrice"); if (lo > hi) throw new AppError("minPrice cannot exceed maxPrice"); filter.price = { ...(minPrice !== undefined && { $gte: lo }), ...(maxPrice !== undefined && { $lte: hi }) }; }
  if (rating !== undefined) filter.rating = { $gte: number(rating, "rating"), $lte: 5 };
  if (stock !== undefined || availability !== undefined) { const value = String(stock ?? availability); if (!["in", "out", "true", "false"].includes(value)) throw new AppError("stock must be in or out"); filter.stock = ["in", "true"].includes(value) ? { $gt: 0 } : 0; }
  if (isActive !== undefined) { if (!["true", "false"].includes(String(isActive))) throw new AppError("isActive must be true or false"); filter.isActive = String(isActive) === "true"; } else filter.isActive = true;
  const sorts = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1, reviewCount: -1 }, popularity: { reviewCount: -1, rating: -1 } }; if (!sorts[sort]) throw new AppError("Invalid sort option");
  const [products, total] = await Promise.all([Product.find(filter).populate("category", "name").sort(sorts[sort]).skip((page - 1) * limit).limit(limit), Product.countDocuments(filter)]);
  res.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ sellerId: req.user._id }).populate("category", "name").sort("-createdAt");
  res.json({ products });
});
export const getProduct = asyncHandler(async (req, res) => { const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate("category", "name"); if (!product) throw new AppError("Product not found", 404); res.json({ product }); });
export const createProduct = asyncHandler(async (req, res) => { const data = body(req.body); if (!data.name || data.price === undefined || data.stock === undefined || !data.category) throw new AppError("Missing required product fields"); if (!(await Category.exists({ _id: data.category }))) throw new AppError("Category not found", 400); const images = req.files?.length ? await Promise.all(req.files.map(uploadImage)) : []; try { res.status(201).json({ product: await Product.create({ ...data, ...(req.user.role === "vendor" && { sellerId: req.user._id }), images, image: images[0]?.url }) }); } catch (e) { await removeCloudinary(images); throw e; } });
const owned = (product, user) => user.role === "admin" || product.sellerId?.toString() === user._id.toString();
export const updateProduct = asyncHandler(async (req, res) => { const data = body(req.body); if (data.category && !(await Category.exists({ _id: data.category }))) throw new AppError("Category not found", 400); const product = await Product.findById(req.params.id); if (!product) throw new AppError("Product not found", 404); if (!owned(product, req.user)) throw new AppError("You can only manage your own products", 403); let ids = req.body.removeImagePublicIds || []; if (typeof ids === "string") { try { ids = JSON.parse(ids); } catch { ids = [ids]; } } if (!Array.isArray(ids)) throw new AppError("removeImagePublicIds must be an array"); const removed = product.images.filter((x) => ids.includes(x.publicId)), uploads = req.files?.length ? await Promise.all(req.files.map(uploadImage)) : []; Object.assign(product, data); product.images = [...product.images.filter((x) => !ids.includes(x.publicId)), ...uploads]; product.image = product.images[0]?.url; try { await product.save(); await removeCloudinary(removed); res.json({ product }); } catch (e) { await removeCloudinary(uploads); throw e; } });
export const deleteProduct = asyncHandler(async (req, res) => { const product = await Product.findById(req.params.id); if (!product) throw new AppError("Product not found", 404); if (!owned(product, req.user)) throw new AppError("You can only manage your own products", 403); await product.deleteOne(); await removeCloudinary(product.images); res.json({ message: "Product deleted" }); });
