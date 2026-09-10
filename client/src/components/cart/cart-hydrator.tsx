"use client";

import { getCart } from "@/services/cart";
import { setItemCount } from "@/store/slices/cart-slice";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function CartHydrator() {
  const { isSignedIn } = useUser();
  const dispatch = useDispatch();
  const cart = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: Boolean(isSignedIn),
    retry: false,
  });

  useEffect(() => {
    if (!isSignedIn) {
      dispatch(setItemCount(0));
      return;
    }
    if (cart.data?.cart) {
      dispatch(setItemCount(cart.data.cart.items.reduce((sum, item) => sum + item.quantity, 0)));
    }
  }, [cart.data, dispatch, isSignedIn]);

  return null;
}
