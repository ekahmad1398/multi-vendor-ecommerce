export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[0.9] rounded-2xl bg-stone-200" />
      <div className="mt-3 h-3 w-14 rounded bg-stone-200" />
      <div className="mt-2 h-4 w-3/4 rounded bg-stone-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-stone-200" />
    </div>
  );
}
