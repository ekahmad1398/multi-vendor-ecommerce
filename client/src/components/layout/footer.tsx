import Link from "next/link";

export function Footer() {
  const blocks = [
    ["Shop", [["All products", "/products"], ["Categories", "/categories"], ["Wishlist", "/wishlist"]]],
    ["Account", [["Your profile", "/profile"], ["Orders", "/orders"], ["Sign in", "/sign-in"]]],
  ] as const;

  return (
    <footer className="border-t border-stone-200 bg-[#f1eee8]">
      <div className="shell grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <Link href="/" className="font-serif text-3xl tracking-[-0.07em]">
            morrow<span className="text-amber-700">.</span>
          </Link>
          <p className="mt-3 max-w-52 text-sm leading-6 text-slate-500">
            Useful, beautiful things for everyday living — sourced from independent sellers.
          </p>
        </div>
        {blocks.map(([title, items]) => (
          <div key={title}>
            <h3 className="font-medium">{title}</h3>
            <div className="mt-3 flex flex-col gap-2">
              {items.map(([label, href]) => (
                <Link className="text-sm text-slate-500 hover:text-slate-900" key={label} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="shell border-t border-stone-200 py-5 text-xs text-slate-500">© 2026 Morrow. All rights reserved.</div>
    </footer>
  );
}
