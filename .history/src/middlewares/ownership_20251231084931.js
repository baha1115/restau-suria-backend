// File: src/middlewares/ownership.js
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Restaurant = require("../models/Restaurant");

/**
 * يتحقق أن المستخدم (owner) يملك هذا المطعم.
 * admin مسموح دائمًا.
 * ويثبت restaurant في req.restaurant
 */
const requireRestaurantOwnership = asyncHandler(async (req, res, next) => {
  const restaurantId = req.params.id;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) throw new AppError("Restaurant not found", 404);

  if (req.user.role === "admin") {
    req.restaurant = restaurant;
    return next();
  }

  const owns =
    String(restaurant.createdBy) === String(req.user._id) ||
    (req.user.restaurantId && String(req.user.restaurantId) === String(restaurant._id));

  if (!owns) throw new AppError("Forbidden (not your restaurant)", 403);

  req.restaurant = restaurant;
  next();
});

/**
 * Generic resource ownership by restaurantId field
 * Model must have restaurantId
 * attaches doc to req.resource and req.restaurant to reuse
 */
function requireResourceOwnership(Model, paramName) {
  return asyncHandler(async (req, res, next) => {
    const id = req.params[paramName];
    const doc = await Model.findById(id);
    if (!doc || doc.isActive === false) throw new AppError("Resource not found", 404);

    const restaurant = await Restaurant.findById(doc.restaurantId);
    if (!restaurant || !restaurant.isActive) throw new AppError("Restaurant not found", 404);

    if (req.user.role !== "admin") {
      const owns =
        String(restaurant.createdBy) === String(req.user._id) ||
        (req.user.restaurantId && String(req.user.restaurantId) === String(restaurant._id));
      if (!owns) throw new AppError("Forbidden", 403);
    }

    req.resource = doc;
    req.restaurant = restaurant;
    next();
  });
}

module.exports = { requireRestaurantOwnership, requireResourceOwnership };
