// File: src/controllers/owner.table.controller.js
const Table = require("../models/Table");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { ok, created } = require("../utils/response");
const { env } = require("../config/env");
const { qrToPngBuffer } = require("../utils/qrcode");

// POST /api/owner/restaurants/:id/tables/bulk
const bulkCreateTables = asyncHandler(async (req, res) => {
  const { from, to } = req.body;
  if (to < from) throw new AppError("'to' must be >= 'from'", 400);

  const restaurantId = req.restaurant._id;

  const toCreate = [];
  for (let n = from; n <= to; n++) {
    toCreate.push({
      restaurantId,
      number: n,
      label: `Table ${n}`
    });
  }

  // insertMany مع ordered:false لتجاوز duplicates
  let inserted = [];
  try {
    inserted = await Table.insertMany(toCreate, { ordered: false });
  } catch (e) {
    // duplicates ممكن تصير، عادي
  }

  return created(res, { createdCount: inserted.length }, "Tables created (bulk)");
});

// GET /api/owner/restaurants/:id/tables
const listTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ restaurantId: req.restaurant._id, isActive: true }).sort({ number: 1 });
  return ok(res, { tables }, "Tables");
});

// GET /api/owner/restaurants/:id/qr?table=5
const qrForTable = asyncHandler(async (req, res) => {
  const table = req.query.table ? Number(req.query.table) : null;
  const slug = req.restaurant.slug;

  const url = table
    ? `${env.BASE_URL}/r/${slug}?t=${table}`
    : `${env.BASE_URL}/r/${slug}`;

  const png = await qrToPngBuffer(url);
  res.setHeader("Content-Type", "image/png");
  return res.send(png);
});

module.exports = { bulkCreateTables, listTables, qrForTable };
