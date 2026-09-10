import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell py-24 text-center">
      <p className="eyebrow">Missing page</p>
      <h1 className="mt-3 font-serif text-4xl">This page isn’t in the collection.</h1>
      <Link href="/products" className="btn btn-dark mt-6">
        Browse products
      </Link>
    </div>
  );
}
