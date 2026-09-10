import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "cart",
  initialState: { itemCount: 0 },
  reducers: {
    setItemCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload;
    },
  },
});

export const { setItemCount } = slice.actions;
export default slice.reducer;
