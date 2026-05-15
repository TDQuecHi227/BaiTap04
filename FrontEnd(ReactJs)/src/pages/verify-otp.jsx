import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, clearMessages } from "../store/authSlice.js";
import { AuthLayout } from "../components/layout/AuthLayout.jsx";
import {
  InputField,
  Button,
  Alert,
  AuthCard,
} from "../components/ui/index.jsx";

function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMsg } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");
  const [fieldError, setFieldError] = useState("");

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
    return () => dispatch(clearMessages());
  }, [dispatch, email, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = otp.trim();
    
    if (!value) {
      setFieldError("Vui lòng nhập mã OTP.");
      return;
    }

    if (value.length !== 6) {
      setFieldError("Mã OTP phải có 6 chữ số.");
      return;
    }

    dispatch(verifyOtp({ email, otp: value }))
      .unwrap()
      .then((response) => {
        // Nếu thành công và có resetToken, chuyển sang trang đặt lại mật khẩu
        if (response.resetToken) {
          navigate("/reset-password", { 
            state: { resetToken: response.resetToken } 
          });
        } else {
          // Trường hợp verify tài khoản (đăng ký)
          navigate("/login");
        }
      })
      .catch(() => {});
  };

  return (
    <AuthLayout>
      <AuthCard>
        <button
          onClick={() => navigate("/forgot-password")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-5 transition-colors"
          type="button"
        >
          ← Quay lại
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 text-2xl">
            📧
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Xác thực OTP
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-relaxed">
            Mã OTP đã được gửi đến <span className="font-semibold text-gray-900">{email}</span>. 
            Vui lòng nhập mã để tiếp tục.
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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="flex justify-between gap-2 md:gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={otp[index] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (!val && e.nativeEvent.inputType !== "deleteContentBackward") return;
                  
                  const newOtp = otp.split("");
                  newOtp[index] = val;
                  const combined = newOtp.join("");
                  setOtp(combined);
                  setFieldError("");

                  // Tự động nhảy sang ô tiếp theo
                  if (val && index < 5) {
                    document.getElementById(`otp-${index + 1}`)?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  // Xử lý nút Backspace để quay lại ô trước
                  if (e.key === "Backspace" && !otp[index] && index > 0) {
                    document.getElementById(`otp-${index - 1}`)?.focus();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  setOtp(pasteData);
                  // Focus vào ô cuối cùng sau khi paste
                  document.getElementById(`otp-${Math.min(pasteData.length, 5)}`)?.focus();
                }}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all outline-none
                  ${fieldError ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"}`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {loading ? "Đang xác thực..." : "Xác thực mã OTP"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Không nhận được mã?{" "}
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-brand-600 font-semibold hover:text-brand-700"
            type="button"
          >
            Gửi lại mã
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default VerifyOtpPage;
