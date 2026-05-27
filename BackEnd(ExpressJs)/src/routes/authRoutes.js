const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  loginLimiter,
  forgotPasswordLimiter,
  registerLimiter,
  otpLimiter,
} = require("../middleware/rateLimiter");
const {
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
  validateRegister,
  validateOtp,
} = require("../validations/validator");

const initAuthRoute = (app) => {
  router.post("/login", loginLimiter, validateLogin, authController.login);
  router.post("/google", authController.googleLogin);
  router.post(
    "/register",
    registerLimiter,
    validateRegister,
    authController.register,
  );

  // POST /api/auth/forgot-password
  router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateForgotPassword,
    authController.forgotPassword,
  );

  // POST /api/auth/resend-otp
  router.post(
    "/resend-otp",
    otpLimiter,
    validateForgotPassword, // Re-uses the validation that checks if the body has a valid email address
    authController.resendOtp,
  );

  // POST /api/auth/verify-otp
  router.post(
    "/verify-otp",
    otpLimiter,
    validateVerifyOtp,
    authController.verifyOtp,
  );

  // POST /api/auth/reset-password — Bước 3: Đặt lại mật khẩu
  router.post(
    "/reset-password",
    validateResetPassword,
    authController.resetPassword,
  );

  router.post("/logout", authController.logout);
  return app.use("/api/auth", router);
};

module.exports = initAuthRoute;
