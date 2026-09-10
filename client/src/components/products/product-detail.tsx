"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { getProduct, getProducts } from "@/services/catalog";
import { addCartItem } from "@/services/cart";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/services/wishlist";
import { createReview, deleteReview, getReviews } from "@/services/reviews";
import { getBackendProfile } from "@/services/auth";
import { Button, ErrorState } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/products/catalog";
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { money, salePrice } from "@/lib/format";
import Link from "next/link";

export function ProductDetail({ id }: { id: string }) {
  const client = useQueryClient();
  const { isSignedIn } = useUser();
  const productQuery = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id), retry: false });
  const reviews = useQuery({ queryKey: ["reviews", id], queryFn: () => getReviews(id) });
  const profile = useQuery({ queryKey: ["backend-profile"], queryFn: getBackendProfile, enabled: Boolean(isSignedIn), retry: false });
  const wishlist = useQuery({ queryKey: ["wishlist"], queryFn: getWishlist, enabled: Boolean(isSignedIn), retry: false });
  const related = useQuery({
    queryKey: ["products", "related", productQuery.data?.category?._id],
    queryFn: () => getProducts({ category: productQuery.data!.category!._id, limit: "4" }),
    enabled: Boolean(productQuery.data?.category?._id),
  });
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const saved = Boolean(wishlist.data?.wishlist.products.some((item: { _id: string }) => item._id === id));
  const userId = profile.data?._id || profile.data?.id;

  const cart = useMutation({
    mutationFn: () => addCartItem(id, quantity),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to your bag");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const wish = useMutation({
    mutationFn: () => (saved ? removeFromWishlist(id) : addToWishlist(id)),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const review = useMutation({
    mutationFn: () => createReview(id, { rating, comment }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["reviews", id] });
      client.invalidateQueries({ queryKey: ["product", id] });
      setComment("");
      toast.success("Review published");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeReview = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["reviews", id] });
      client.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Review removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (productQuery.isLoading) {
    return (
      <div className="shell grid gap-10 py-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-stone-200" />
        <div className="h-96 animate-pulse rounded-3xl bg-stone-100" />
      </div>
    );
  }
  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="shell py-12">
        <ErrorState onRetry={() => productQuery.refetch()} />
      </div>
    );
  }

  const product = productQuery.data;
  const images = product.images?.length ? product.images : product.image ? [{ url: product.image }] : [];
  const price = salePrice(product.price, product.discount);
  const others = related.data?.products.filter((item) => item._id !== product._id).slice(0, 4) ?? [];

  return (
    <div className="shell py-10">
      <p className="text-sm text-slate-500">
        <Link href="/products" className="hover:text-slate-900">Shop</Link>
        {" / "}
        <Link href={`/products?category=${product.category?._id ?? ""}`} className="hover:text-slate-900">
          {product.category?.name ?? "Shop"}
        </Link>
        {" / "}
        {product.name}
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-[2rem] bg-stone-100">
            {images[imageIndex] ? (
              <img src={images[imageIndex].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-8xl text-stone-400">M</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border ${imageIndex === index ? "border-amber-700" : "border-transparent"}`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="eyebrow">{product.brand || product.category?.name || "Morrow"}</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            {product.rating.toFixed(1)}
            <span className="text-slate-500">({product.reviewCount} reviews)</span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-medium">{money(price)}</p>
            {product.discount > 0 && (
              <>
                <p className="pb-1 text-slate-400 line-through">{money(product.price)}</p>
                <span className="mb-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>
          <p className={`mt-4 text-sm font-semibold ${product.stock ? "text-emerald-700" : "text-rose-600"}`}>
            {product.stock ? `${product.stock} in stock — ready to ship` : "Currently out of stock"}
          </p>
          {product.description && <p className="mt-6 max-w-lg leading-7 text-slate-600">{product.description}</p>}
          <div className="mt-8 flex gap-3">
            <div className="flex items-center rounded-full border border-stone-300">
              <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3">
                <Plus size={16} />
              </button>
            </div>
            <Button disabled={!product.stock} loading={cart.isPending} onClick={() => cart.mutate()} className="btn-dark flex-1">
              <ShoppingBag size={17} /> Add to bag
            </Button>
            <button onClick={() => wish.mutate()} aria-label="Toggle wishlist" className="icon border border-stone-300">
              <Heart size={18} className={saved ? "fill-rose-600 text-rose-600" : ""} />
            </button>
          </div>
          <dl className="mt-8 grid grid-cols-2 border-t border-stone-200 pt-6 text-sm">
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="mt-1 font-medium">{product.category?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">SKU</dt>
              <dd className="mt-1 font-medium">{product.sku || "—"}</dd>
            </div>
          </dl>
          <div className="mt-7 flex gap-3 border-t border-stone-200 pt-6 text-sm text-slate-600">
            <Truck size={19} className="text-amber-700" />
            Delivery and returns are confirmed at checkout.
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-stone-200 py-12">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Customer notes</p>
            <h2>Reviews</h2>
          </div>
        </div>
        {isSignedIn && (
          <form
            className="card mb-8 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              review.mutate();
            }}
          >
            <p className="font-medium">Share your experience</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} stars`}>
                  <Star size={20} className={value <= rating ? "fill-amber-500 text-amber-500" : "text-stone-300"} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="input mt-4 min-h-24"
              placeholder="What did you think?"
            />
            <Button loading={review.isPending} className="btn-dark mt-4">
              Publish review
            </Button>
          </form>
        )}
        {reviews.isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-stone-100" />
        ) : reviews.data?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.data.map((item) => (
              <article key={item._id} className="card p-5">
                <div className="flex text-amber-500">{"★".repeat(item.rating)}</div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.comment || "No written comment."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{item.user.name}</p>
                  {userId && item.user._id === userId && (
                    <button onClick={() => removeReview.mutate(item._id)} className="text-xs text-rose-600">
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No reviews yet. Be the first to share your experience.</p>
        )}
      </section>

      {others.length > 0 && (
        <section className="border-t border-stone-200 py-12">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More like this</p>
              <h2>From the same category</h2>
            </div>
          </div>
          <ProductGrid products={others} />
        </section>
      )}
    </div>
  );
}
