import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart?.items.length) throw new AppError("Your cart is empty", 400);
  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const items = cart.items.map((item) => {
    const product = productMap.get(item.product.toString());
    if (!product || !product.isActive) throw new AppError("A product in your cart is unavailable", 400);
    if (product.stock < item.quantity) throw new AppError(`${product.name} does not have enough stock`, 400);
    const price = product.price * (1 - (product.discount || 0) / 100);
    return { product: product._id, sellerId: product.sellerId, name: product.name, price, quantity: item.quantity, subtotal: price * item.quantity, brand: product.brand };
  });
  // Prices are fetched from MongoDB, never accepted from the browser, preventing price tampering.
  const subtotal = cart.items.reduce((total, item) => total + productMap.get(item.product.toString()).price * item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.subtotal, 0);
  const reducedItems = [];
  let order;
  try {
    for (const item of items) {
      // The stock condition makes each decrement safe even if two customers order at once.
      const changed = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (!changed.modifiedCount) throw new AppError("Stock changed while ordering. Please try again.", 409);
      reducedItems.push(item);
    }
    const address = req.body.shippingAddress;
    if (!address || !["fullName", "phone", "address", "city", "country"].every((key) => typeof address[key] === "string" && address[key].trim())) throw new AppError("A complete shippingAddress is required");
    const paymentMethod = req.body.paymentMethod || "cash_on_delivery";
    if (!["cash_on_delivery", "card", "bank_transfer"].includes(paymentMethod)) throw new AppError("Invalid payment method");
    order = await Order.create({ user: req.user._id, items, shippingAddress: address, subtotal, discount: subtotal - totalPrice, total: totalPrice, totalPrice, paymentMethod });
    cart.items = [];
    await cart.save();
    res.status(201).json({ order });
  } catch (error) {
    // Restore any earlier items if a later stock check or order save fails.
    if (order) await Order.findByIdAndDelete(order._id);
    await Promise.all(reducedItems.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
    throw error;
  }
});
export const getMyOrders = asyncHandler(async (req, res) => res.json({ orders: await Order.find({ user: req.user._id }).sort("-createdAt") }));
export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError("Order not found", 404);
  res.json({ order });
});
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).select("+stockRestored");
  if (!order) throw new AppError("Order not found", 404);
  // Mixed-seller orders keep a summary status. Check every line so a shipped
  // or delivered item cannot be cancelled merely because that summary is processing.
  if (!order.items.length || order.items.some((item) => !["pending", "processing"].includes(item.status || order.status))) throw new AppError("This order can no longer be cancelled", 400);
  if (!order.stockRestored) { await Promise.all(order.items.filter((item) => !item.stockRestored).map(async (item) => { await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }); item.stockRestored = true; item.status = "cancelled"; })); order.stockRestored = true; }
  order.status = "cancelled"; await order.save(); res.json({ order });
});
export const getAllOrders = asyncHandler(async (req, res) => { const filter = {}; if (req.query.status) filter.status = req.query.status; if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus; res.json({ orders: await Order.find(filter).populate("user", "name email").sort("-createdAt") }); });
export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.sellerId": req.user._id }).populate("user", "name email").sort("-createdAt");
  const sellerId = req.user._id.toString();
  res.json({ orders: orders.map((order) => ({ ...order.toObject(), items: order.items.filter((item) => item.sellerId?.toString() === sellerId) })) });
});
export const updateSellerOrderItemStatus = asyncHandler(async (req, res) => {
  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status)) throw new AppError("Invalid order status");
  const order = await Order.findOne({ _id: req.params.orderId, items: { $elemMatch: { _id: req.params.itemId, sellerId: req.user._id } } }).select("+stockRestored");
  if (!order) throw new AppError("Order not found", 404);
  const item = order.items.id(req.params.itemId);
  if (!item || item.sellerId?.toString() !== req.user._id.toString()) throw new AppError("Order item not found", 404);
  if (item.status === "cancelled") throw new AppError("A cancelled order item cannot be changed", 400);
  if (req.body.status === "cancelled" && !item.stockRestored) { await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }); item.stockRestored = true; }
  item.status = req.body.status;
  const statuses = order.items.map((item) => item.status || order.status);
  order.status = statuses.every((status) => status === statuses[0]) ? statuses[0] : "processing";
  await order.save();
  res.json({ order: { ...order.toObject(), items: [item.toObject()] } });
});
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const [products, orderStats] = await Promise.all([
    Product.countDocuments({ sellerId }),
    Order.aggregate([{ $match: { "items.sellerId": sellerId } }, { $unwind: "$items" }, { $match: { "items.sellerId": sellerId } }, { $group: { _id: null, orders: { $addToSet: "$_id" }, revenue: { $sum: { $cond: [{ $and: [{ $ne: ["$items.status", "cancelled"] }, { $or: [{ $eq: ["$paymentStatus", "paid"] }, { $eq: ["$items.status", "delivered"] }] }] }, "$items.subtotal", 0] } }, units: { $sum: { $cond: [{ $ne: ["$items.status", "cancelled"] }, "$items.quantity", 0] } } } }])
  ]);
  const stats = orderStats[0] || { orders: [], revenue: 0, units: 0 };
  res.json({ totalProducts: products, totalOrders: stats.orders.length, revenue: stats.revenue, unitsSold: stats.units });
});
export const getAdminStats = asyncHandler(async (req, res) => {
  const [User, ProductModel] = await Promise.all([import("../models/User.js"), import("../models/Product.js")]);
  const [stats = { totals: [], ordersByStatus: [], bestSellingProducts: [], salesByCategory: [], salesByDay: [], salesByMonth: [] }] = await Order.aggregate([
    {
      // $facet runs several small reports over the same orders collection.
      $facet: {
        totals: [
          // $group combines all orders into one totals document.
          { $group: { _id: null, totalOrders: { $sum: 1 }, totalSales: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "cancelled"] }, { $or: [{ $eq: ["$paymentStatus", "paid"] }, { $eq: ["$status", "delivered"] }] }] }, "$total", 0] } } } },
          { $project: { _id: 0, totalOrders: 1, totalSales: 1 } },
        ],
        ordersByStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          // $sort makes the response stable and easiest to read.
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ],
        bestSellingProducts: [
          // $match removes cancelled orders before calculating sales.
          { $match: { status: { $ne: "cancelled" }, $or: [{ paymentStatus: "paid" }, { status: "delivered" }] } },
          // $unwind turns each order item into its own pipeline document.
          { $unwind: "$items" },
          { $group: { _id: "$items.product", productName: { $first: "$items.name" }, unitsSold: { $sum: "$items.quantity" }, sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
          { $sort: { unitsSold: -1, sales: -1 } },
          // $limit keeps this dashboard list short.
          { $limit: 5 },
          // $lookup joins the current Product document onto each sales result.
          { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, productId: "$_id", name: { $ifNull: ["$product.name", "$productName"] }, unitsSold: 1, sales: 1 } },
        ],
        salesByCategory: [
          { $match: { status: { $ne: "cancelled" }, $or: [{ paymentStatus: "paid" }, { status: "delivered" }] } },
          { $unwind: "$items" },
          { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } },
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          { $group: { _id: { $ifNull: ["$category.name", "Uncategorized"] }, sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
          { $sort: { sales: -1, _id: 1 } },
          { $project: { _id: 0, category: "$_id", sales: 1 } },
        ],
        salesByDay: [{ $match: { status: { $ne: "cancelled" }, $or: [{ paymentStatus: "paid" }, { status: "delivered" }] } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, sales: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, date: "$_id", sales: 1, orders: 1 } }],
        salesByMonth: [{ $match: { status: { $ne: "cancelled" }, $or: [{ paymentStatus: "paid" }, { status: "delivered" }] } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, sales: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, month: "$_id", sales: 1, orders: 1 } }],
      },
    },
  ]);

  const [totalUsers, totalProducts] = await Promise.all([User.default.countDocuments(), ProductModel.default.countDocuments()]);
  res.json({
    totals: stats.totals[0] || { totalOrders: 0, totalSales: 0 },
    ordersByStatus: stats.ordersByStatus,
    bestSellingProducts: stats.bestSellingProducts,
    salesByCategory: stats.salesByCategory,
    salesByDay: stats.salesByDay,
    salesByMonth: stats.salesByMonth,
    averageOrderValue: stats.totals[0] ? stats.totals[0].totalSales / Math.max(stats.totals[0].totalOrders, 1) : 0,
    totalUsers,
    totalProducts,
  });
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status)) throw new AppError("Invalid order status");
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);
  if (order.status === "cancelled") throw new AppError("A cancelled order cannot be changed", 400);
  if (req.body.status === "cancelled" && !order.stockRestored) {
    // Cancelling releases reserved stock so it can be bought by another customer.
    await Promise.all(order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
  }
  if (req.body.paymentStatus && !["pending", "paid", "failed", "refunded"].includes(req.body.paymentStatus)) throw new AppError("Invalid payment status");
  order.status = req.body.status; order.items.forEach((item) => { item.status = req.body.status; if (req.body.status === "cancelled") item.stockRestored = true; }); if (req.body.status === "cancelled") order.stockRestored = true; if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  await order.save();
  res.json({ order });
});
