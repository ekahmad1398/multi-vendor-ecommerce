import { SellerShell } from "@/components/seller/seller-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
