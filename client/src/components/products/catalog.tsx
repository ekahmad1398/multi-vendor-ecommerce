"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalAuth } from "@/components/auth/local-auth-provider";
import type { Category, Product } from "@/types";
import { addCartItem } from "@/services/cart";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/services/wishlist";
import { money, productImage, salePrice } from "@/lib/format";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useLocalAuth();
  const wishlist = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: Boolean(isSignedIn),
    retry: false,
  });
  const saved = Boolean(wishlist.data?.wishlist.products.some((item: Product) => item._id === product._id));
  const cart = useMutation({
    mutationFn: () => addCartItem(product._id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to your bag");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const wish = useMutation({
    mutationFn: () => (saved ? removeFromWishlist(product._id) : addToWishlist(product._id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const image = productImage(product);
  const price = salePrice(product.price, product.discount);

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Link
        href={`/products/${product._id}`}
        className="relative grid aspect-[0.9] place-items-center overflow-hidden rounded-2xl bg-slate-100 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
      >
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-slate-400">M</span>
        )}
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-violet-700 px-2 py-1 text-[10px] font-bold text-white">
            -{product.discount}%
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            wish.mutate();
          }}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90"
          disabled={wish.isPending}
        >
          <Heart size={15} className={saved ? "fill-rose-600 text-rose-600" : ""} />
        </button>
      </Link>
      <div className="px-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500">{product.brand || product.category?.name}</p>
          <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
            <Star size={12} className="fill-violet-500 text-violet-500" />
            {(product.rating ?? 0).toFixed(1)}
            <span className="hidden sm:inline">({product.reviewCount ?? 0})</span>
          </span>
        </div>
        <Link href={`/products/${product._id}`} className="mt-1 block font-medium hover:text-violet-800">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-medium">
            {money(price)}
            {product.discount > 0 && (
              <span className="ml-1 text-sm font-normal text-slate-400 line-through">{money(product.price)}</span>
            )}
          </p>
          <button
            type="button"
            disabled={product.stock < 1 || cart.isPending}
            onClick={() => cart.mutate()}
            aria-label={`Add ${product.name} to cart`}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-white disabled:bg-slate-300"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
        {product.stock < 1 && <p className="mt-2 text-xs font-medium text-rose-600">Out of stock</p>}
      </div>
    </motion.article>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category, index) => (
        <motion.div whileHover={{ y: -4 }} key={category._id}>
          <Link href={`/products?category=${category._id}`} className="card block min-h-40 p-5 hover:border-violet-300">
            <span className="font-serif text-3xl text-violet-700">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-7 font-serif text-2xl">{category.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description || "Explore the collection"}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
