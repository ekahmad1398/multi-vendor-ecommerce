# Manual API smoke test

1. Register, obtain the email OTP from the configured mail service, verify it, then log in.
2. Use the returned Bearer token (or cookie) for protected calls. Promote one test user to `admin` directly in development only.
3. Create a category, then POST a multipart product with `images`; verify GET products filtering/pagination.
4. Add the product to cart, inspect server totals, create an order with a shipping address, then verify `/my` and cancellation.
5. Add/remove wishlist entries and create/update/delete a review; confirm product rating and reviewCount update.
6. As admin, list/filter orders, change status once to cancelled, verify stock only restores once, then request dashboard stats.

Use test accounts and placeholder values only. Do not put credentials or tokens in a collection file.
