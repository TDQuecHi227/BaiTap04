const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const hashPassword = require("../utils/hashPassword");
const emailService = require("./emailService");
const otpService = require("./otpService");

const loginUser = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!user.isVerified) {
    const err = new Error("ACCOUNT_NOT_VERIFIED");
    err.email = user.email;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("UNAUTHORIZED");
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  let redirect_url = user.role === "admin" ? "/admin/profile" : "/user/profile";

  return { accessToken, refreshToken, redirect_url };
};

const registerUser = async (userData) => {
  const { username, email, password } = userData;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const hashedPassword = await hashPassword(password);
  const { code, expiresAt } = otpService.createOtp();
  const hashedOtp = await bcrypt.hash(code, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    isVerified: false,
    otp: { code: hashedOtp, expiresAt },
  });

  await newUser.save();
  await emailService.sendOtpEmail(email, code, "register");

  return {
    message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.",
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  const { code, expiresAt } = otpService.createOtp();
  const hashedOtp = await bcrypt.hash(code, 10);

  user.otp = {
    code: hashedOtp,
    expiresAt,
  };
  await user.save();

  await emailService.sendOtpEmail(email, code, "reset");
};

const resendOtp = async (email, type = "register") => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (type === "register" && user.isVerified) {
    throw new Error("ALREADY_VERIFIED");
  }

  const { code, expiresAt } = otpService.createOtp();
  const hashedOtp = await bcrypt.hash(code, 10);

  user.otp = {
    code: hashedOtp,
    expiresAt,
  };
  await user.save();

  await emailService.sendOtpEmail(email, code, type);
  return { message: "Mã OTP mới đã được gửi thành công!" };
};

const verifyOtp = async (email, otpCode) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.otp || !user.otp.code) {
    throw new Error("INVALID_OTP");
  }

  if (new Date() > user.otp.expiresAt) {
    throw new Error("OTP_EXPIRED");
  }

  const isMatch = await bcrypt.compare(otpCode, user.otp.code);
  if (!isMatch) {
    throw new Error("INVALID_OTP");
  }

  // Nếu là luồng đăng ký (chưa verify)
  if (!user.isVerified) {
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    return { message: "Xác thực tài khoản thành công!" };
  }

  // Nếu là luồng quên mật khẩu (đã verify rồi)
  const resetToken = jwt.sign(
    { id: user._id, purpose: "reset_password" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

  return { resetToken };
};

const resetPassword = async (resetToken, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch {
    throw new Error("INVALID_TOKEN");
  }

  if (decoded.purpose !== "reset_password") {
    throw new Error("INVALID_TOKEN");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  await user.save();
};

const loginWithGoogle = async (googleIdToken) => {
  const ticket = await client.verifyIdToken({
    idToken: googleIdToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({
    $or: [{ googleId: googleId }, { email: email }],
  });

  if (!user) {
    const baseUsername = email.split("@")[0];
    const randomSuffix = Math.floor(Math.random() * 10000);

    user = await User.create({
      username: `${baseUsername}_${randomSuffix}`,
      email: email,
      googleId: googleId,
      isVerified: true,
      role: "user",
      profile: {
        fullName: name,
        avatarUrl: picture,
      },
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isVerified = true;
    await user.save();
  }

  const tokenPayload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  let redirect_url = user.role === "admin" ? "/admin/profile" : "/user/profile";

  return { accessToken, refreshToken, redirect_url };
};

module.exports = {
  loginUser,
  registerUser,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  loginWithGoogle,
};
