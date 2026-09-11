"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { useState } from "react";
import { Toaster } from "sonner";
import { store } from "@/store";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { LocalAuthProvider } from "@/components/auth/local-auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );

  return (
    <QueryClientProvider client={client}>
      <LocalAuthProvider>
        <Provider store={store}>
          <CartHydrator />
          {children}
          <Toaster richColors position="top-right" />
        </Provider>
      </LocalAuthProvider>
    </QueryClientProvider>
  );
}
