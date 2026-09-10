"use client";

import { LiveProductGrid } from "@/components/products/live-product-grid";
import { getCategories } from "@/services/catalog";
import { Button, PageHeader } from "@/components/ui/primitives";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProductsCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(searchParams.get("search") ?? "");
  const [result, setResult] = useState({ total: 0, totalPages: 1 });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("stock") === "in";
  const rating = searchParams.get("rating") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const setFilters = (updates: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const params = useMemo(
    () => ({
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      ...(inStock ? { stock: "in" } : {}),
      ...(rating ? { rating } : {}),
      page: String(page),
      limit: "12",
    }),
    [search, category, sort, minPrice, maxPrice, inStock, rating, page],
  );

  const panel = (
    <aside className="card h-fit p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Refine</p>
          <h2 className="mt-1 font-serif text-2xl">Filters</h2>
        </div>
        <button aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="icon mobile-only">
          <X size={18} />
        </button>
      </div>
      <label className="mt-6 block text-sm font-semibold">
        Category
        <select
          value={category}
          onChange={(event) => setFilters({ category: event.target.value || undefined })}
          className="input mt-2"
        >
          <option value="">All categories</option>
          {categories.data?.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-5">
        <p className="text-sm font-semibold">Price range</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => setFilters({ minPrice: event.target.value || undefined })}
            className="input"
            placeholder="Min"
            min="0"
            type="number"
          />
          <input
            value={maxPrice}
            onChange={(event) => setFilters({ maxPrice: event.target.value || undefined })}
            className="input"
            placeholder="Max"
            min="0"
            type="number"
          />
        </div>
      </div>
      <label className="mt-5 block text-sm font-semibold">
        Minimum rating
        <select value={rating} onChange={(event) => setFilters({ rating: event.target.value || undefined })} className="input mt-2">
          <option value="">Any rating</option>
          <option value="4">4 stars and up</option>
          <option value="3">3 stars and up</option>
        </select>
      </label>
      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-3 text-sm font-medium">
        <input
          checked={inStock}
          onChange={(event) => setFilters({ stock: event.target.checked ? "in" : undefined })}
          type="checkbox"
          className="accent-amber-700"
        />
        In stock only
      </label>
      <Button
        onClick={() => {
          setDraftSearch("");
          router.replace(pathname);
        }}
        className="btn-light mt-6 w-full"
      >
        Clear filters
      </Button>
    </aside>
  );

  return (
    <div className="shell py-10 sm:py-14">
      <PageHeader
        eyebrow="The collection"
        title="Objects for everyday"
        description="Thoughtfully sourced goods from independent sellers, all in one considered collection."
      />
      <div className="mt-8 flex flex-wrap gap-3 border-y border-stone-200 py-4">
        <form
          className="relative min-w-56 flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ search: draftSearch.trim() || undefined });
          }}
        >
          <Search className="absolute left-3 top-3 text-slate-400" size={17} />
          <input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            className="input pl-9"
            placeholder="Search the collection"
          />
          <button className="sr-only" type="submit">
            Search
          </button>
        </form>
        <button onClick={() => setFiltersOpen(true)} className="btn btn-light mobile-only">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <select
          value={sort}
          onChange={(event) => setFilters({ sort: event.target.value })}
          aria-label="Sort products"
          className="rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium"
        >
          <option value="newest">Newest arrivals</option>
          <option value="popularity">Most popular</option>
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-[250px_1fr]">
        <div className="filter-desktop">{panel}</div>
        {filtersOpen && (
          <div className="filter-drawer fixed inset-0 z-50 bg-slate-950/35 p-3">
            <div className="ml-auto h-full max-w-sm overflow-auto rounded-2xl bg-[#faf7f2] p-4 shadow-2xl">{panel}</div>
          </div>
        )}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {result.total ? `${result.total} product${result.total === 1 ? "" : "s"}` : "Browse the collection"}
            </p>
            {search && (
              <button
                onClick={() => {
                  setDraftSearch("");
                  setFilters({ search: undefined });
                }}
                className="text-link"
              >
                Clear search
              </button>
            )}
          </div>
          <LiveProductGrid params={params} onResult={setResult} />
          {result.totalPages > 1 && (
            <nav aria-label="Product pages" className="mt-10 flex items-center justify-center gap-2">
              <Button disabled={page === 1} onClick={() => setFilters({ page: String(page - 1) }, false)} className="btn-light">
                Previous
              </Button>
              <span className="px-3 text-sm text-slate-500">
                Page {page} of {result.totalPages}
              </span>
              <Button
                disabled={page === result.totalPages}
                onClick={() => setFilters({ page: String(page + 1) }, false)}
                className="btn-dark"
              >
                Next
              </Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
