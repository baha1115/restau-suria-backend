// File: src/middlewares/rateLimit.js
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false
});
// Forgot password limiter (أقوى)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many password reset attempts. Try again later.",
      errors: null
    });
  }
});

// Reset password limiter
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Try again later.",
      errors: null
    });
  }
});
module.exports = { authLimiter, resetPasswordLimiter, forgotPasswordLimiter };
