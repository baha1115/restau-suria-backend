// File: src/controllers/admin.controller.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { ok, created } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

// GET /api/admin/restaurants
const listRestaurantsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.city) filter.city = req.query.city;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Restaurant.countDocuments(filter)
  ]);

  return ok(res, { items, page, limit, total, totalPages: Math.ceil(total / limit) }, "Admin restaurants");
});

// PATCH /api/admin/restaurants/:id/activate
const activateRestaurant = asyncHandler(async (req, res) => {
  const r = await Restaurant.findById(req.params.id);
  if (!r) throw new AppError("Restaurant not found", 404);
  r.isActive = !!req.body.isActive;
  await r.save();
  return ok(res, { restaurantId: r._id, isActive: r.isActive }, "Restaurant activation updated");
});

// PATCH /api/admin/restaurants/:id/feature
const featureRestaurant = asyncHandler(async (req, res) => {
  const r = await Restaurant.findById(req.params.id);
  if (!r) throw new AppError("Restaurant not found", 404);
  r.isFeatured = !!req.body.isFeatured;
  await r.save();
  return ok(res, { restaurantId: r._id, isFeatured: r.isFeatured }, "Restaurant featured updated");
});

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    User.find().select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);

  return ok(res, { items, page, limit, total, totalPages: Math.ceil(total / limit) }, "Users");
});

// POST /api/admin/owners  => create owner
const createOwner = asyncHandler(async (req, res) => {
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

  return created(res, { user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "Owner created");
});

// PATCH /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new AppError("User not found", 404);
  u.isActive = !!req.body.isActive;
  await u.save();
  return ok(res, { userId: u._id, isActive: u.isActive }, "User activation updated");
});

module.exports = {
  listRestaurantsAdmin,
  activateRestaurant,
  featureRestaurant,
  listUsers,
  createOwner,
  activateUser
};
