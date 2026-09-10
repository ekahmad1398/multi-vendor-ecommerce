import { CartPanel } from "@/components/cart/cart-panel";
import { PageHeader } from "@/components/ui/primitives";

export default function Cart() {
  return (
    <div className="shell py-12">
      <PageHeader eyebrow="Your bag" title="Ready when you are" description="Review your chosen pieces before checkout." />
      <div className="mt-8">
        <CartPanel />
      </div>
    </div>
  );
}
