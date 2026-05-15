import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "",
  withCredentials: true,
});

// Cookie jwt được gửi tự động nhờ withCredentials: true
// Không cần gắn Authorization header thủ công

instance.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    if (error?.response?.data) return Promise.reject(error.response.data);
    return Promise.reject(error);
  },
);

export default instance;
