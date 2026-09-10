export default function Loading() {
  return (
    <div className="shell animate-pulse py-12">
      <div className="h-4 w-24 rounded bg-stone-200" />
      <div className="mt-4 h-12 w-72 rounded bg-stone-200" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="aspect-[0.8] rounded-2xl bg-stone-200" />
        ))}
      </div>
    </div>
  );
}
