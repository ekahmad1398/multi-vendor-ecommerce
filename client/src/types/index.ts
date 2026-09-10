export type Category = {
  _id: string;
  name: string;
  description?: string;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  brand?: string;
  sku?: string;
  isActive?: boolean;
  sellerId?: string;
  rating: number;
  reviewCount: number;
  category?: Category;
  images?: { url: string; publicId: string }[];
  image?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  available: boolean;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
};

export type Order = {
  _id: string;
  items: {
    _id?: string;
    product: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    brand?: string;
    status?: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

export type Review = {
  _id: string;
  user: { _id?: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
};
