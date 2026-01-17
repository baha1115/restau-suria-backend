// File: src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { env } = require("./config/env");
const { sendEmail } = require("../config/email");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildResetEmailHtml({ name, resetLink }) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6">
    <h2>إعادة تعيين كلمة المرور</h2>
    <p>مرحباً ${name || ""}</p>
    <p>اضغط على الزر لإعادة تعيين كلمة المرور (صالح لمدة قصيرة):</p>
    <p>
      <a href="${resetLink}" style="background:#16a34a;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:inline-block">
        إعادة تعيين كلمة المرور
      </a>
    </p>
    <p>إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
  </div>`;
}

// POST /api/auth/register (conditional)
const register = asyncHandler(async (req, res) => {
  if (!env.ALLOW_PUBLIC_REGISTER) {
    if (!req.user || req.user.role !== "admin") {
      throw new AppError("Register is disabled. Admin only.", 403);
    }
  }

  const { name, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError("Email already used", 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "owner"
  });

  const token = signToken(user);

  return created(
    res,
    { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    "Registered"
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new AppError("Invalid credentials", 401);

  const token = signToken(user);

  return ok(
    res,
    {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      }
    },
    "Logged in"
  );
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user }, "Me");
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();

  // دائماً نفس الرسالة لحماية الخصوصية (لا نكشف إن الإيميل موجود)
  const genericMsg =
    "إذا كان هذا البريد مسجلاً لدينا فستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.";

  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    return ok(res, {}, genericMsg);
  }

  // Generate token (raw) + store hash
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
  const tokenHash = hashResetToken(rawToken);

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + env.RESET_PASSWORD_EXPIRES_MIN * 60 * 1000);
  await user.save();

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Reset link: ${resetLink}`,
      html: buildResetEmailHtml({ name: user.name, resetLink })
    });
  } catch (e) {
    // إذا فشل الإرسال: امسح التوكن حتى لا يبقى Token صالح بدون إرسال
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    throw new AppError("Unable to send reset email. Check SMTP settings.", 500);
  }

  return ok(res, {}, genericMsg);
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenHash = hashResetToken(token);

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
    isActive: true
  }).select("+resetPasswordTokenHash +resetPasswordExpiresAt"); // فقط للتأكد (اختياري)

  if (!user) throw new AppError("Invalid or expired reset token", 400);

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return ok(res, {}, "Password has been reset successfully");
});

module.exports = { register, login, me, forgotPassword, resetPassword };
