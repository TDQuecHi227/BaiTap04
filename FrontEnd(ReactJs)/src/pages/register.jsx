import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, clearMessages } from "../store/authSlice.js";
import { AuthLayout } from "../components/layout/AuthLayout.jsx";
import {
  InputField,
  Button,
  Alert,
  AuthCard,
} from "../components/ui/index.jsx";
import { useToast } from "../components/context/ToastContext.jsx";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { loading, error, successMsg } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

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
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    const nextErrors = {};
    if (!username) nextErrors.username = "Vui lòng nhập username.";
    if (!email) nextErrors.email = "Vui lòng nhập email.";
    if (!password) nextErrors.password = "Vui lòng nhập mật khẩu.";
    if (!confirmPassword)
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu không khớp.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    dispatch(registerUser({ username, email, password }))
      .unwrap()
      .then((response) => {
        addToast("Đăng ký tài khoản thành công!", "success");
        navigate("/login", { replace: true });
      })
      .catch(() => {});
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Tạo tài khoản mới ✨
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Bắt đầu hành trình học tiếng Anh của bạn hoàn toàn miễn phí.
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
            <Alert type="success" message={successMsg} />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            label="Username"
            type="text"
            placeholder="Tên đăng nhập duy nhất"
            value={form.username}
            onChange={updateField("username")}
            error={errors.username}
            autoComplete="username"
            autoFocus
          />

          <InputField
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={updateField("email")}
            error={errors.email}
            autoComplete="email"
          />

          <InputField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={updateField("password")}
            error={errors.password}
            autoComplete="new-password"
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
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="mt-2">
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-brand-600 font-semibold hover:text-brand-700"
          >
            Đăng nhập
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default RegisterPage;
