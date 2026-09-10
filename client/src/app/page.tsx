"use client";

import { CategoryGrid, ProductGrid } from "@/components/products/catalog";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "@/services/catalog";
import { ProductSkeleton } from "@/components/ui/product-skeleton";
import { ErrorState } from "@/components/ui/primitives";

export default function Home() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const products = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getProducts({ sort: "popularity", limit: "8" }),
  });

  return (
    <>
      <section className="hero">
        <div className="shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">New season, considered</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Everyday objects,
              <br />
              <em className="font-serif font-normal text-amber-700">beautifully chosen.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Shop a live catalogue of goods from independent sellers — prices, stock, and reviews come straight from the store.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-dark">
                Shop the collection <ArrowRight size={17} />
              </Link>
              <Link href="/categories" className="btn btn-light">
                Explore categories
              </Link>
            </div>
          </div>
          <div className="relative min-h-[310px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,#fef3c7,transparent_30%),linear-gradient(135deg,#f2dfc7,#c9d7c9)]">
            <div className="absolute right-10 top-12 h-52 w-52 rounded-full border-[18px] border-white/45" />
            <div className="absolute bottom-12 left-12 rounded-3xl bg-white/75 px-6 py-5 backdrop-blur">
              <p className="text-sm text-slate-500">The edit of the week</p>
              <p className="mt-1 font-serif text-2xl text-slate-950">Soft utility</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-16">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Browse with ease</p>
            <h2>Find your corner</h2>
          </div>
          <Link href="/categories" className="text-link">
            All categories <ArrowRight size={16} />
          </Link>
        </div>
        {categories.isError ? (
          <ErrorState onRetry={() => categories.refetch()} />
        ) : categories.data?.length ? (
          <CategoryGrid categories={categories.data} />
        ) : (
          <p className="text-slate-500">Categories will appear here once the store is stocked.</p>
        )}
      </section>

      <section className="bg-stone-100 py-16">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Made to be used</p>
              <h2>Popular right now</h2>
            </div>
            <Link href="/products?sort=popularity" className="text-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {products.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : products.data?.products.length ? (
            <ProductGrid products={products.data.products} />
          ) : (
            <p className="text-slate-500">No products are live yet.</p>
          )}
        </div>
      </section>

      <section className="shell py-16">
        <div className="grid overflow-hidden rounded-[2rem] bg-slate-950 text-white md:grid-cols-2">
          <div className="p-9 sm:p-14">
            <p className="eyebrow text-amber-300">A little more for less</p>
            <h2 className="mt-4 font-serif text-4xl">Find pieces that fit your budget.</h2>
            <p className="mt-5 text-slate-300">
              Sort the live catalogue by price and shop active offers with availability confirmed by the store.
            </p>
            <Link className="btn mt-8 bg-white text-slate-950" href="/products?sort=price_asc">
              Shop by price
            </Link>
          </div>
          <div className="min-h-64 bg-[linear-gradient(145deg,#a7bfa7,#d8a36c)]" />
        </div>
      </section>

      <section className="shell grid gap-6 border-t border-stone-200 py-10 sm:grid-cols-3">
        {[
          [Truck, "Thoughtful delivery", "Free delivery on qualifying orders."],
          [Undo2, "Easy returns", "Fourteen days to change your mind."],
          [ShieldCheck, "Made to last", "Pieces selected for real life."],
        ].map(([Icon, title, copy]) => {
          const Item = Icon as typeof Truck;
          return (
            <div key={String(title)} className="flex gap-4">
              <Item className="mt-1 text-amber-700" size={21} />
              <div>
                <h3 className="font-medium">{String(title)}</h3>
                <p className="mt-1 text-sm text-slate-500">{String(copy)}</p>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
