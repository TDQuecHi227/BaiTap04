import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCartApi, addToCartApi, removeFromCartApi } from "../util/api";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCartApi();
      return response.data; // data from response.data (axios)
    } catch (error) {
      return rejectWithValue(
        error.message || "Lỗi khi lấy giỏ hàng"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await addToCartApi(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Lỗi khi thêm vào giỏ hàng"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await removeFromCartApi(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Lỗi khi xóa khỏi giỏ hàng"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      // axios data -> response.data.data -> cart object
      state.items = action.payload?.items || [];
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // addToCart
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // removeFromCart
    builder.addCase(removeFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
