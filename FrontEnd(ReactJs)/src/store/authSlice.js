import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  googleLoginApi,
  registerApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  getUserProfileApi,
  updateProfileApi,
  logoutAPI,
} from "../util/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await loginApi(identifier, password);
      // Cookie jwt được server set tự động, frontend không cần xử lý token
      if (res?.redirect_url) return res;
      return rejectWithValue(res?.message || "Đăng nhập thất bại");
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi kết nối server");
    }
  },
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLogin",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const res = await googleLoginApi(idToken);
      if (res?.redirect_url) return res;
      return rejectWithValue(res?.message || "Đăng nhập Google thất bại");
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi kết nối server");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const res = await registerApi(username, email, password);
      if (res?.message) return res;
      return rejectWithValue(res?.message || "Đăng ký thất bại");
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi kết nối server");
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await forgotPasswordApi(email);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi kết nối server");
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await verifyOtpApi(email, otp);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Mã OTP không hợp lệ");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, newPassword }, { rejectWithValue }) => {
    try {
      const res = await resetPasswordApi(resetToken, newPassword);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Không thể đặt lại mật khẩu");
    }
  },
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUserProfileApi();
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Không thể tải thông tin");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await updateProfileApi(profileData);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Cập nhật thất bại");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await logoutAPI();
    }
    catch (err) {
      console.log("Lỗi khi gọi API đăng xuất", err);
    }
    finally {
      dispatch(logout());
    }
  }
)
const initialState = {
  user: null,
  // Bắt đầu là false, chỉ set true sau khi gọi fetchUserProfile thành công
  isAuthenticated: false,
  // initializing: true khi app mới load -> chờ verify cookie xong mới redirect
  initializing: true,
  loading: false,
  error: null,
  successMsg: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initializing = false;
      state.error = null;
      state.successMsg = null;
      // Không cần xóa localStorage vì token lưu trong httpOnly cookie
    },
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
      state.successMsg = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.successMsg = action.payload?.message || "Đăng nhập thành công!";
      })
      .addCase(loginUser.rejected, rejected);

    builder
      .addCase(googleLoginUser.pending, pending)
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.successMsg =
          action.payload?.message || "Đăng nhập Google thành công!";
      })
      .addCase(googleLoginUser.rejected, rejected);

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg =
          action.payload?.message || "Đăng ký thành công! Vui lòng đăng nhập.";
      })
      .addCase(registerUser.rejected, rejected);

    builder
      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMsg =
          "Email khôi phục đã được gửi! Kiểm tra hộp thư của bạn.";
      })
      .addCase(forgotPassword.rejected, rejected);

    builder
      .addCase(verifyOtp.pending, pending)
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.successMsg = "Xác thực OTP thành công!";
      })
      .addCase(verifyOtp.rejected, rejected);

    builder
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMsg = "Mật khẩu đã được cập nhật!";
      })
      .addCase(resetPassword.rejected, rejected);

    builder
      .addCase(fetchUserProfile.pending, pending)
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.initializing = false;
        state.user = action.payload?.data || null;
        state.isAuthenticated = true;
      })
      // Token hết hạn hoặc không hợp lệ -> tự động logout
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        state.initializing = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("access_token");
      });

    builder
      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = "Cập nhật hồ sơ thành công!";
        if (action.payload?.data) state.user = action.payload.data;
      })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, clearMessages, setUser } = authSlice.actions;
export default authSlice.reducer;
