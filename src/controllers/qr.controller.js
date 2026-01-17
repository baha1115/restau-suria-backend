// File: src/controllers/qr.controller.js
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { env } = require("../config/env");
const { qrToPngBuffer } = require("../utils/qrcode");

// GET /api/qr/:slug?t=5
const publicQr = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const t = req.query.t ? Number(req.query.t) : null;

  const restaurant = await Restaurant.findOne({ slug, isActive: true }).select("slug");
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const url = t ? `${env.BASE_URL}/r/${slug}?t=${t}` : `${env.BASE_URL}/r/${slug}`;
  const png = await qrToPngBuffer(url);

  res.setHeader("Content-Type", "image/png");
  return res.send(png);
});


module.exports = { publicQr };
