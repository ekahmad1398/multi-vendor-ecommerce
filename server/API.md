# E-Commerce API

Base URL: `http://localhost:PORT`. JSON responses use `{ message }` for errors. Send `Authorization: Bearer <token>` or use the HTTP-only cookie (`credentials: "include"`). Admin endpoints require an admin account.

## Auth

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | No | `name,email,password` |
| POST | `/api/auth/login` | No | `email,password` |
| POST | `/api/auth/logout` | No | — |
| GET | `/api/auth/profile` | Yes | — |
| POST | `/api/auth/verify-email` | No | `email,otp` |
| POST | `/api/auth/resend-otp` | No | `email` |
| POST | `/api/auth/forgot-password` | No | `email` |
| POST | `/api/auth/reset-password` | No | `email,otp,password` |
| PATCH | `/api/auth/change-password` | Yes | `currentPassword,newPassword` |

## Catalogue

`GET /api/categories` is public; category POST/PUT/DELETE are admin (`name`). `GET /api/products` is public and returns `{ products, pagination: { page, limit, total, totalPages } }`. Query: `search`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `stock=in|out`, `isActive`, `sort=newest|oldest|price_asc|price_desc|rating|popularity`, `page`, `limit`.

`GET /api/products/:id` is public. Product POST/PUT/DELETE are admin. Product POST and PUT accept `multipart/form-data`: `name`, `description`, `price`, `stock`, `category`, `brand`, `sku`, `discount`, `isActive`, and up to six `images` files. PUT may include `removeImagePublicIds` (JSON array). Product fields include `images: [{url, publicId}]`, rating, and reviewCount.

## Cart, wishlist, reviews

All endpoints below require authentication.

| Method | Endpoint | Body |
|---|---|---|
| GET | `/api/cart` | — |
| POST | `/api/cart/items` | `productId,quantity` |
| PUT/DELETE | `/api/cart/items/:productId` | `quantity` for PUT |
| DELETE | `/api/cart` | — |
| GET | `/api/wishlist` | — |
| POST/DELETE | `/api/wishlist/:productId` | — |
| GET | `/api/products/:id/reviews` | public |
| POST | `/api/products/:id/reviews` | `rating,comment` |
| PUT/DELETE | `/api/reviews/:id` | `rating,comment` for PUT |

Cart returns product details plus server-calculated `subtotal`, `discount`, and `total`; clients must never supply prices.

## Orders and admin

| Method | Endpoint | Auth | Body/query |
|---|---|---|---|
| POST | `/api/orders` | User | `shippingAddress`, optional `paymentMethod` |
| GET | `/api/orders/my` | User | — |
| GET | `/api/orders/my/:id` | User | — |
| PATCH | `/api/orders/my/:id/cancel` | User | — |
| GET | `/api/orders` | Admin | optional `status,paymentStatus` |
| PATCH | `/api/orders/:id/status` | Admin | `status`, optional `paymentStatus` |
| GET | `/api/orders/admin/stats` | Admin | — |

`shippingAddress` needs `fullName`, `phone`, `address`, `city`, and `country`. Orders snapshot product name, paid price, quantity, subtotal, category/brand where available. Dashboard revenue counts non-cancelled orders that are paid or delivered.

## Seller

All seller endpoints require an authenticated, active seller account. A seller can only see products that it owns and only the line items assigned to it; administrative product and order endpoints remain restricted to admins.

| Method | Endpoint | Body |
|---|---|---|
| GET | `/api/seller/dashboard` | — |
| GET/PATCH | `/api/seller/profile` | `name` for PATCH |
| GET/POST | `/api/seller/products` | product multipart fields for POST |
| PUT/DELETE | `/api/seller/products/:id` | product multipart fields for PUT |
| GET | `/api/seller/orders` | — |
| PATCH | `/api/seller/orders/:orderId/items/:itemId/status` | `status` |

## Admin users

Admin-only user administration is available through `GET /api/admin/users?role=user|seller|admin` and `PATCH /api/admin/users/:id`. The PATCH body accepts `role` and/or `sellerStatus` (`active` or `suspended`).
