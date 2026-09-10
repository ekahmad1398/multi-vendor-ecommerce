"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function StoreFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const workspace = path.startsWith("/admin") || path.startsWith("/seller");

  if (workspace) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
