// File: src/controllers/public.controller.js
const Restaurant = require("../models/Restaurant");
const Offer = require("../models/Offer");
const MenuSection = require("../models/MenuSection");
const MenuItem = require("../models/MenuItem");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");
const isOpenNow = require("../utils/openNow");
const { getPagination } = require("../utils/pagination");
const { buildOrderMessage, buildWhatsappUrl } = require("../utils/whatsapp");

// GET /api/public/home
const home = asyncHandler(async (req, res) => {
  const cities = await Restaurant.distinct("city", { isActive: true });
  const types = await Restaurant.distinct("type", { isActive: true });

  const featuredRestaurants = await Restaurant.find({ isActive: true, isFeatured: true })
    .select("name slug city type logoUrl coverUrls deliveryEnabled pickupEnabled")
    .sort({ updatedAt: -1 })
    .limit(12);

  const now = new Date();
  const todayOffers = await Offer.find({
    isActive: true,
    isDeleted: { $ne: true },
    startAt: { $lte: now },
    endAt: { $gte: now }
  })
    .populate("restaurantId", "name slug city type")
    .sort({ createdAt: -1 })
    .limit(20);

  return ok(res, { cities, types, featuredRestaurants, todayOffers }, "Home");
});

// GET /api/public/restaurants
const listRestaurants = asyncHandler(async (req, res) => {
  const { city, type, openNow, delivery } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { isActive: true };
  if (city) filter.city = city;
  if (type) filter.type = type;
  if (delivery === "true") filter.deliveryEnabled = true;

  // ملاحظة: openNow صعب على DB، نفلتر بعد الجلب (MVP)
  const candidates = await Restaurant.find(filter)
    .select("name slug city type logoUrl coverUrls deliveryEnabled pickupEnabled hours")
    .sort({ isFeatured: -1, updatedAt: -1 });

  const withOpen = candidates.map((r) => ({
    ...r.toObject(),
    openNow: isOpenNow(r.hours)
  }));

  const filtered = openNow === "true" ? withOpen.filter((r) => r.openNow === true) : withOpen;

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const items = filtered.slice(skip, skip + limit);

  return ok(res, { items, page, limit, total, totalPages }, "Restaurants");
});

// GET /api/public/search?q=
const search = asyncHandler(async (req, res) => {
  const q = req.query.q.trim();
  const regex = new RegExp(q, "i");

  const restaurants = await Restaurant.find({ isActive: true, $or: [{ name: regex }, { city: regex }, { type: regex }] })
    .select("name slug city type logoUrl deliveryEnabled pickupEnabled")
    .limit(20);

  const menuItems = await MenuItem.find({ isActive: true, name: regex })
    .select("name price currency restaurantId")
    .populate("restaurantId", "name slug city type")
    .limit(20);

  return ok(res, { restaurants, menuItems }, "Search");
});

// GET /api/public/r/:slug
const getRestaurantBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const restaurant = await Restaurant.findOne({ slug, isActive: true }).select("-createdBy");
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const openNow = isOpenNow(restaurant.hours);

  return ok(res, { restaurant: { ...restaurant.toObject(), openNow } }, "Restaurant");
});

// GET /api/public/r/:slug/menu?q=
const getMenuBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const q = (req.query.q || "").trim();
  const regex = q ? new RegExp(q, "i") : null;

  const restaurant = await Restaurant.findOne({ slug, isActive: true }).select("name slug city type whatsapp phone");
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const sections = await MenuSection.find({ restaurantId: restaurant._id, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 });

  const itemFilter = { restaurantId: restaurant._id, isActive: true };
  if (regex) itemFilter.$or = [{ name: regex }, { description: regex }];

  const items = await MenuItem.find(itemFilter).sort({ sortOrder: 1, createdAt: 1 });

  const sectionMap = sections.map((s) => ({
    _id: s._id,
    name: s.name,
    sortOrder: s.sortOrder,
    items: []
  }));

  const idxBySection = new Map(sectionMap.map((s) => [String(s._id), s]));

  items.forEach((it) => {
    const sec = idxBySection.get(String(it.sectionId));
    if (sec) sec.items.push(it);
  });

  return ok(res, { restaurant, sections: sectionMap }, "Menu");
});

// GET /api/public/offers?city=
const listOffers = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const now = new Date();

  let restaurantIds = null;
  if (city) {
    const restaurants = await Restaurant.find({ isActive: true, city }).select("_id");
    restaurantIds = restaurants.map((r) => r._id);
  }

  const filter = {
    isActive: true,
    startAt: { $lte: now },
    endAt: { $gte: now }
  };

  if (restaurantIds) filter.restaurantId = { $in: restaurantIds };

  const offers = await Offer.find(filter)
    .populate("restaurantId", "name slug city type")
    .sort({ createdAt: -1 });

  return ok(res, { offers }, "Offers");
});

// POST /api/public/whatsapp-message
const whatsappMessage = asyncHandler(async (req, res) => {
  const { slug, tableNumber, items, notes } = req.body;

  const restaurant = await Restaurant.findOne({ slug, isActive: true }).select("name whatsapp");
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const message = buildOrderMessage({
    restaurantName: restaurant.name,
    tableNumber,
    items,
    notes
  });

  const whatsappUrl = buildWhatsappUrl(restaurant.whatsapp, message);

  return ok(res, { whatsappUrl, message }, "WhatsApp link");
});

module.exports = {
  home,
  listRestaurants,
  search,
  getRestaurantBySlug,
  getMenuBySlug,
  listOffers,
  whatsappMessage
};
