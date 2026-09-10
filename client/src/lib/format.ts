export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const salePrice = (price: number, discount = 0) =>
  price * (1 - discount / 100);

export const productImage = (product: {
  image?: string;
  images?: { url: string }[];
}) => product.images?.[0]?.url || product.image;

export const orderCode = (id: string) => `#${id.slice(-8).toUpperCase()}`;
