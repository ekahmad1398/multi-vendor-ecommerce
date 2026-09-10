import { configureStore } from "@reduxjs/toolkit";
import cart from "./slices/cart-slice";
import ui from "./slices/ui-slice";

export const store = configureStore({ reducer: { cart, ui } });
export type RootState = ReturnType<typeof store.getState>;
