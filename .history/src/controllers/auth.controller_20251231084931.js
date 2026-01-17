// File: src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register (conditional)
const register = asyncHandler(async (req, res) => {
  // إذا التسجيل العام ممنوع => لازم admin
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

  return created(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "Registered");
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new AppError("Invalid credentials", 401);

  const token = signToken(user);

  return ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId } }, "Logged in");
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user }, "Me");
});

module.exports = { register, login, me };
