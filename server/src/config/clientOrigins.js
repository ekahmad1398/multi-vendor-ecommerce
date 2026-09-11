// The deployed storefront is a first-party browser client. Keep it in the
// allow-list even when a development CLIENT_URL is present in an environment.
const deployedStorefront = "https://e-commerce-nine-mauve-54.vercel.app";
const localStorefront = "http://localhost:3000";

export const clientOrigins = [...new Set([
  localStorefront,
  deployedStorefront,
  ...(process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean),
])];
