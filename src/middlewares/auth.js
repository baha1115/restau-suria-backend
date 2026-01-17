// File: src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

function getToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.replace("Bearer ", "").trim();
}

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError("Unauthorized", 401);

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const user = await User.findById(payload.sub).select("-passwordHash");
  if (!user || !user.isActive) throw new AppError("User not found or inactive", 401);

  req.user = user;
  next();
});

// مفيد للـ register لما يكون conditional
const authOptional = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore
  }

  next();
});

module.exports = { authMiddleware, authOptional };
