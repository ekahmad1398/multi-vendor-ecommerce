"use client";

import Link from "next/link";
import { Heart, Package, ShieldCheck, Store, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBackendProfile } from "@/services/auth";
import { ErrorState, PageHeader } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";

export default function Profile() {
  const profile = useQuery({ queryKey: ["backend-profile"], queryFn: getBackendProfile, retry: false });

  if (profile.isLoading) return <div className="shell py-12"><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  if (profile.isError || !profile.data) {
    return (
      <div className="shell py-12">
        <ErrorState onRetry={() => profile.refetch()} />
      </div>
    );
  }

  const account = profile.data;
  const cards: { Icon: typeof Package; title: string; description: string; href: string }[] = [
    { Icon: Package, title: "Orders", description: "Track deliveries and past purchases", href: "/orders" },
    { Icon: Heart, title: "Wishlist", description: "Pieces you saved for later", href: "/wishlist" },
  ];
  if (account.role === "seller") {
    cards.push({ Icon: Store, title: "Seller studio", description: "Manage products and fulfilment", href: "/seller" });
  }
  if (account.role === "admin") {
    cards.push({ Icon: ShieldCheck, title: "Admin", description: "Operate the store", href: "/admin" });
  }

  return (
    <div className="shell py-12">
      <PageHeader eyebrow="Account" title={`Hello, ${account.name.split(" ")[0]}`} description="Your store account, orders, and saved pieces in one place." />
      <section className="card mt-8 grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-violet-50 text-violet-800">
          <UserRound size={28} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-3xl">{account.name}</h2>
            <Badge>{account.role}</Badge>
            {account.role === "seller" && account.sellerStatus && <Badge tone={account.sellerStatus === "active" ? "green" : "red"}>{account.sellerStatus}</Badge>}
          </div>
          <p className="mt-2 text-sm text-slate-500">{account.email}</p>
          <p className="mt-1 text-xs text-slate-400">Signed in with your Morrow account</p>
        </div>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(({ Icon, title, description, href }) => (
          <Link key={title} href={href} className="card p-6 hover:border-violet-300">
            <Icon size={21} className="text-violet-700" />
            <h2 className="mt-8 font-serif text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
