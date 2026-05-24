import axios from "./axios.customize";

// Auth APIs — matched to BE/src/routes/authRoutes.js
export const loginApi = (identifier, password) =>
  axios.post("/api/auth/login", { identifier, password });

export const googleLoginApi = (idToken) =>
  axios.post("/api/auth/google", { idToken });

export const registerApi = (username, email, password) =>
  axios.post("/api/auth/register", { username, email, password });

export const forgotPasswordApi = (email) =>
  axios.post("/api/auth/forgot-password", { email });

export const verifyOtpApi = (email, otp) =>
  axios.post("/api/auth/verify-otp", { email, otp });

export const resetPasswordApi = (resetToken, newPassword) =>
  axios.post("/api/auth/reset-password", { resetToken, newPassword });

export const logoutAPI = () =>
  axios.post("/api/auth/logout");

// Profile APIs — matched to BE/src/routes/api.js
export const getAllCoursesApi = (page = 1, limit = 9, filters = {}) => {
  const { search = "", category = "All", priceType = "all" } = filters;
  return axios.get(`/courses?page=${page}&limit=${limit}&search=${search}&category=${category}&priceType=${priceType}`);
};

export const getCourseDetailApi = (id) => axios.get(`/courses/${id}`);

export const getUserProfileApi = () =>
  axios.get("/user/profile");

export const getAdminProfileApi = () =>
  axios.get("/admin/profile");

export const updateProfileApi = (profileData) =>
  axios.put("/user/profile", profileData);

export const getHomePageApi = () =>
  axios.get("/home");

export const uploadImageApi = (formData) =>
  axios.post("/api/v1/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Cart APIs
export const getCartApi = () => axios.get("/cart");
export const addToCartApi = (courseId) => axios.post("/cart", { courseId });
export const removeFromCartApi = (courseId) => axios.delete(`/cart/${courseId}`);

// Checkout API
export const checkoutApi = (paymentMethod) => axios.post("/checkout", { paymentMethod });

// Orders APIs
export const getMyOrdersApi = () => axios.get("/orders");
export const cancelOrderApi = (orderId) => axios.post(`/orders/${orderId}/cancel`);

