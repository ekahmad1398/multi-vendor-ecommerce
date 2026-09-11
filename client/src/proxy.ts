import { clerkMiddleware } from "@clerk/nextjs/server";

// Local-password users and Clerk users share the backend session, so page
// authorization is enforced by the API rather than Clerk-only middleware.
export default clerkMiddleware();
