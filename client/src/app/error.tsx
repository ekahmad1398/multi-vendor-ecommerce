"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="shell py-24 text-center">
      <p className="eyebrow">A small hiccup</p>
      <h1 className="mt-3 font-serif text-4xl">We couldn’t load that.</h1>
      <button onClick={reset} className="btn btn-dark mt-6">
        Try again
      </button>
    </div>
  );
}
