import { SellerProductForm } from "@/components/seller/product-form";

export default function NewProduct() {
  return (
    <>
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-serif text-5xl">Add product</h1>
      <div className="mt-8">
        <SellerProductForm />
      </div>
    </>
  );
}
