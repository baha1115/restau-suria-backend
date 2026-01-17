// File: src/controllers/owner.menu.controller.js
const MenuSection = require("../models/MenuSection");
const MenuItem = require("../models/MenuItem");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

// POST /api/owner/restaurants/:id/sections  (req.restaurant موجود)
const createSection = asyncHandler(async (req, res) => {
  const section = await MenuSection.create({
    restaurantId: req.restaurant._id,
    name: req.body.name,
    sortOrder: req.body.sortOrder || 0
  });

  return created(res, { section }, "Section created");
});

// PUT /api/owner/sections/:sectionId  (req.resource موجود)
const updateSection = asyncHandler(async (req, res) => {
  const section = req.resource;

  if (req.body.name !== undefined) section.name = req.body.name;
  if (req.body.sortOrder !== undefined) section.sortOrder = req.body.sortOrder;

  await section.save();
  return ok(res, { section }, "Section updated");
});

// PATCH /api/owner/sections/:sectionId/toggle
const toggleSection = asyncHandler(async (req, res) => {
  const section = req.resource;
  section.isActive = !section.isActive;
  await section.save();
  return ok(res, { section }, "Section toggled");
});

// DELETE /api/owner/sections/:sectionId (soft delete)
const deleteSection = asyncHandler(async (req, res) => {
  const section = req.resource;
  section.isActive = false;
  await section.save();
  return ok(res, { sectionId: section._id }, "Section deleted (soft)");
});

// POST /api/owner/restaurants/:id/items
const createItem = asyncHandler(async (req, res) => {
  const { sectionId, name, description, price, currency, sortOrder, isAvailable, options } = req.body;

  // مهم: تأكد أن القسم تابع لنفس المطعم
  const section = await MenuSection.findOne({ _id: sectionId, restaurantId: req.restaurant._id, isActive: true });
  if (!section) throw new AppError("Section not found for this restaurant", 404);

  const item = await MenuItem.create({
    restaurantId: req.restaurant._id,
    sectionId,
    name,
    description: description || "",
    price,
    currency: currency || "SYP",
    sortOrder: sortOrder || 0,
    isAvailable: isAvailable !== undefined ? !!isAvailable : true,
    options: options || []
  });

  return created(res, { item }, "Item created");
});

// PUT /api/owner/items/:itemId
const updateItem = asyncHandler(async (req, res) => {
  const item = req.resource;

  const allowed = ["sectionId", "name", "description", "price", "currency", "sortOrder", "options", "isAvailable", "imageUrl"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) item[k] = req.body[k];
  });

  // لو غيّر sectionId تأكد أنه نفس المطعم
  if (req.body.sectionId) {
    const section = await MenuSection.findOne({ _id: req.body.sectionId, restaurantId: item.restaurantId, isActive: true });
    if (!section) throw new AppError("Invalid sectionId for this restaurant", 400);
  }

  await item.save();
  return ok(res, { item }, "Item updated");
});

// PATCH /api/owner/items/:itemId/availability
const updateAvailability = asyncHandler(async (req, res) => {
  const item = req.resource;
  item.isAvailable = req.body.isAvailable;
  await item.save();
  return ok(res, { item }, "Availability updated");
});

// DELETE /api/owner/items/:itemId (soft delete)
const deleteItem = asyncHandler(async (req, res) => {
  const item = req.resource;
  item.isActive = false;
  await item.save();
  return ok(res, { itemId: item._id }, "Item deleted (soft)");
});

module.exports = {
  createSection,
  updateSection,
  toggleSection,
  deleteSection,
  createItem,
  updateItem,
  updateAvailability,
  deleteItem
};
