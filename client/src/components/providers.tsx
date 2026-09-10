"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { useState } from "react";
import { Toaster } from "sonner";
import { store } from "@/store";
import { ClerkBridge } from "@/components/auth/clerk-bridge";
import { CartHydrator } from "@/components/cart/cart-hydrator";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );

  return (
    <ClerkProvider>
      <QueryClientProvider client={client}>
        <Provider store={store}>
          <ClerkBridge />
          <CartHydrator />
          {children}
          <Toaster richColors position="top-right" />
        </Provider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
