const authService = require("../services/authService");
const httpStatus = require("http-status").status;

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const authResult = await authService.loginUser(identifier, password);

    res.cookie("jwt", authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(httpStatus.OK).json({
      message: "Đăng nhập thành công",
      redirect_url: authResult.redirect_url,
    });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Không tìm thấy người dùng hoặc sai mật khẩu." });
    }
    if (error.message === "ACCOUNT_NOT_VERIFIED") {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({
          message: "Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.",
          email: error.email,
        });
    }

    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(httpStatus.CREATED).json(result);
  } catch (error) {
    if (error.message === "USER_ALREADY_EXISTS") {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Email hoặc Username đã tồn tại." });
    }
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Không tìm thấy Google Token." });
    }

    const authResult = await authService.loginWithGoogle(idToken);

    res.cookie("jwt", authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(httpStatus.OK).json({
      message: "Đăng nhập Google thành công",
      redirect_url: authResult.redirect_url,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Xác thực Google thất bại." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);

    return res.status(httpStatus.OK).json({
      message:
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    if (error.message === "EMAIL_NOT_FOUND") {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Email không tồn tại trong hệ thống." });
    }

    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    const result = await authService.resendOtp(email, type || "register");
    return res.status(httpStatus.OK).json(result);
  } catch (error) {
    const errorMessages = {
      USER_NOT_FOUND: "Không tìm thấy người dùng.",
      ALREADY_VERIFIED: "Tài khoản đã được xác thực trước đó.",
    };

    if (errorMessages[error.message]) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages[error.message] });
    }

    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, otpCode } = req.body;
    const code = otp || otpCode;
    const result = await authService.verifyOtp(email, code);

    if (result.resetToken) {
      return res.status(httpStatus.OK).json({
        message: "OTP hợp lệ. Bạn có thể đặt lại mật khẩu.",
        resetToken: result.resetToken,
      });
    }

    return res.status(httpStatus.OK).json(result);
  } catch (error) {
    const errorMessages = {
      USER_NOT_FOUND: "Không tìm thấy người dùng.",
      ALREADY_VERIFIED: "Tài khoản đã được xác thực trước đó.",
      INVALID_OTP: "Mã OTP không chính xác.",
      OTP_EXPIRED: "Mã OTP đã hết hạn.",
    };

    if (errorMessages[error.message]) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages[error.message] });
    }

    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    await authService.resetPassword(resetToken, newPassword);

    return res
      .status(httpStatus.OK)
      .json({ message: "Mật khẩu đã được đặt lại thành công." });
  } catch (error) {
    if (error.message === "INVALID_TOKEN") {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Không tìm thấy người dùng." });
    }

    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ." });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    return res.status(httpStatus.OK).json({ message: "Đăng xuất thành công" })
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Lỗi server nội bộ" })
  }
}
module.exports = {
  login,
  googleLogin,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  register,
  logout,
};
