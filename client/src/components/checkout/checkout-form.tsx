"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/primitives";
import { useState } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { createOrder } from "@/services/orders";
import { toast } from "sonner";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { orderCode } from "@/lib/format";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(6, "Enter a valid phone number"),
  address: z.string().min(5, "Enter your address"),
  city: z.string().min(2, "Enter your city"),
  country: z.string().min(2, "Enter your country"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "card", "bank_transfer"]),
});

type Values = z.infer<typeof schema>;

export function CheckoutForm() {
  const [orderId, setOrderId] = useState("");
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { paymentMethod: "cash_on_delivery" } });

  if (orderId) {
    return (
      <div className="card grid min-h-80 place-items-center p-8 text-center">
        <div>
          <CheckCircle2 className="mx-auto text-emerald-600" size={46} />
          <h2 className="mt-4 font-serif text-3xl">Order placed</h2>
          <p className="mt-3 text-sm text-slate-500">
            Your order {orderCode(orderId)} is confirmed and ready to track.
          </p>
          <Link href={`/orders/${orderId}`} className="btn btn-dark mt-6">
            View order
          </Link>
        </div>
      </div>
    );
  }

  const field = (name: keyof Omit<Values, "paymentMethod">, label: string) => (
    <label className="block text-sm font-medium">
      {label}
      <input className="input mt-2" {...register(name)} />
      {errors[name] && <span className="mt-1 block text-xs text-rose-600">{errors[name]?.message}</span>}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          const { paymentMethod, ...shippingAddress } = values;
          const result = await createOrder(shippingAddress, paymentMethod);
          client.invalidateQueries({ queryKey: ["cart"] });
          client.invalidateQueries({ queryKey: ["orders"] });
          setOrderId(result.order._id);
          toast.success("Order placed");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to place order");
        }
      })}
      className="card p-6 sm:p-8"
    >
      <h2 className="font-serif text-3xl">Delivery details</h2>
      <p className="mt-2 text-sm text-slate-500">Where should we send your order?</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {field("fullName", "Full name")}
        {field("phone", "Phone number")}
        <div className="sm:col-span-2">{field("address", "Street address")}</div>
        {field("city", "City")}
        {field("country", "Country")}
        {field("postalCode", "Postal code (optional)")}
      </div>
      <fieldset className="mt-8 border-t border-slate-200 pt-7">
        <legend className="font-serif text-2xl">Payment method</legend>
        <div className="mt-4 grid gap-3">
          {[
            ["cash_on_delivery", "Cash on delivery", "Pay when your order arrives."],
            ["card", "Card", "Payment will be confirmed at checkout."],
            ["bank_transfer", "Bank transfer", "Instructions are shown after your order."],
          ].map(([value, title, copy]) => (
            <label
              key={value}
              className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-violet-600 has-[:checked]:bg-violet-50"
            >
              <input type="radio" value={value} {...register("paymentMethod")} />
              <span>
                <b className="block text-sm">{title}</b>
                <span className="text-xs text-slate-500">{copy}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button loading={isSubmitting} className="btn-dark mt-8 w-full">
        <LockKeyhole size={16} /> Place secure order
      </Button>
    </form>
  );
}
