import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const populatedCart = (userId) => Cart.findOne({ user: userId }).populate("items.product", "name price stock image images discount isActive");
const responseCart = async (userId) => {
  const cart = (await populatedCart(userId)) || { user: userId, items: [] };
  const items = cart.items.filter((item) => item.product).map((item) => { const product = item.product; const unitPrice = product.price * (1 - (product.discount || 0) / 100); return { product, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity, available: product.isActive && product.stock >= item.quantity }; });
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { ...(cart.toObject ? cart.toObject() : cart), items, subtotal, discount: subtotal - total, total };
};
export const getCart = asyncHandler(async (req, res) => res.json({ cart: await responseCart(req.user._id) }));
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) throw new AppError("Quantity must be a positive whole number");
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError("Active product not found", 404);
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);
  const newQuantity = (item?.quantity || 0) + quantity;
  if (newQuantity > product.stock) throw new AppError("Requested quantity exceeds available stock", 400);
  if (item) item.quantity = newQuantity;
  else cart.items.push({ product: productId, quantity });
  await cart.save();
  res.status(201).json({ cart: await responseCart(req.user._id) });
});
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) throw new AppError("Quantity must be a positive whole number");
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) throw new AppError("Active product not found", 404);
  if (quantity > product.stock) throw new AppError("Requested quantity exceeds available stock", 400);
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find((cartItem) => cartItem.product.toString() === req.params.productId);
  if (!item) throw new AppError("Cart item not found", 404);
  item.quantity = quantity;
  await cart.save();
  res.json({ cart: await responseCart(req.user._id) });
});
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError("Cart item not found", 404);
  const oldLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  if (cart.items.length === oldLength) throw new AppError("Cart item not found", 404);
  await cart.save();
  res.json({ cart: await responseCart(req.user._id) });
});
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: "Cart cleared" });
});
