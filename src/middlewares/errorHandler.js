// File: src/middlewares/errorHandler.js
const AppError = require("../utils/AppError");

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.details || null
  });
}

module.exports = { notFound, errorHandler };
