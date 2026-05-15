import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword, clearMessages } from "../store/authSlice.js";
import { AuthLayout } from "../components/layout/AuthLayout.jsx";
import {
  InputField,
  Button,
  Alert,
  AuthCard,
} from "../components/ui/index.jsx";

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMsg } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      navigate("/login");
    }
    return () => dispatch(clearMessages());
  }, [dispatch, resetToken, navigate]);

  const updateField = (field) => (event) => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const nextErrors = {};
    if (!form.password) nextErrors.password = "Vui lòng nhập mật khẩu mới.";
    if (form.password && form.password.length < 6) nextErrors.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    dispatch(resetPassword({ resetToken, newPassword: form.password }))
      .unwrap()
      .then(() => {
        // Thành công -> về login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch(() => {});
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 text-2xl">
            🔒
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Đặt lại mật khẩu
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-relaxed">
            Sắp xong rồi! Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={() => dispatch(clearMessages())}
            />
          </div>
        ) : null}
        {successMsg ? (
          <div className="mb-4">
            <Alert type="success" message={successMsg + " Đang chuyển hướng..."} />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            label="Mật khẩu mới"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={updateField("password")}
            error={errors.password}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            }
          />

          <InputField
            label="Xác nhận mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={loading}>
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
