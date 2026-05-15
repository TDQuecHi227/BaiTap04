import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword, clearMessages } from "../store/authSlice.js";
import { AuthLayout } from "../components/layout/AuthLayout.jsx";
import {
  InputField,
  Button,
  Alert,
  AuthCard,
} from "../components/ui/index.jsx";

function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMsg } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = email.trim();
    if (!value) {
      setFieldError("Vui lòng nhập email.");
      return;
    }

    dispatch(forgotPassword({ email: value }))
      .unwrap()
      .then(() => {
        navigate("/verify-otp", { state: { email: value } });
      })
      .catch(() => {});
  };

  return (
    <AuthLayout>
      <AuthCard>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-5 transition-colors"
          type="button"
        >
          ← Quay lại đăng nhập
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 text-2xl">
            🔑
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Quên mật khẩu?
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-relaxed">
            Không sao! Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại
            mật khẩu.
          </p>
        </div>

        {(error || fieldError) && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error || fieldError}
              onClose={() => dispatch(clearMessages())}
            />
          </div>
        )}
        {successMsg && (
          <div className="mb-4">
            <Alert type="success" message={successMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            label="Địa chỉ Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldError("");
            }}
            autoComplete="email"
            autoFocus
          />

          <Button type="submit" loading={loading}>
            {loading ? "Đang gửi..." : "Gửi hướng dẫn khôi phục"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nhớ ra mật khẩu rồi?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-brand-600 font-semibold hover:text-brand-700"
            type="button"
          >
            Đăng nhập
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
