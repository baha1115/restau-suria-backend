// File: src/controllers/owner.restaurant.controller.js
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const slugifyUnique = require("../utils/slugifyUnique");
import  { uploadBufferToCloudinary,deleteCloudinaryByUrl } from "../utils/cloudinaryUpload.js";

const { env } = require("../config/env");

// POST /api/owner/restaurants
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, city, type, whatsapp, phone, addressText, location, hours, deliveryEnabled, pickupEnabled } = req.body;

  const slug = await slugifyUnique(Restaurant, name);

  const restaurant = await Restaurant.create({
    name,
    slug,
    city,
    type,
    whatsapp,
    phone: phone || "",
    addressText: addressText || "",
    location: location || { lat: null, lng: null },
    hours: hours || { timezone: "Asia/Damascus", weekly: [] },
    deliveryEnabled: !!deliveryEnabled,
    pickupEnabled: pickupEnabled !== undefined ? !!pickupEnabled : true,
    createdBy: req.user._id
  });

  // لو owner ليس لديه restaurantId -> اربطه
  if (req.user.role === "owner" && !req.user.restaurantId) {
    await User.findByIdAndUpdate(req.user._id, { restaurantId: restaurant._id });
  }

  return created(res, { restaurant }, "Restaurant created");
});

// PUT /api/owner/restaurants/:id  (req.restaurant موجود من middleware)
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = req.restaurant;

  const allowed = [
    "name",
    "city",
    "type",
    "whatsapp",
    "phone",
    "addressText",
    "location",
    "hours",
    "deliveryEnabled",
    "pickupEnabled"
  ];

  allowed.forEach((k) => {
    if (req.body[k] !== undefined) restaurant[k] = req.body[k];
  });

  // لو الاسم تغير، لا تغيّر slug تلقائياً (حتى لا ينكسر QR)
  await restaurant.save();

  return ok(res, { restaurant }, "Restaurant updated");
});

// POST /api/owner/restaurants/:id/logo
const uploadLogo = asyncHandler(async (req, res) => {
  const restaurant = req.restaurant;
  if (!req.file) throw new AppError("File is required (field name: file)", 400);

  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/restaurants/${restaurant.slug}`
  });

  restaurant.logoUrl = uploaded.secure_url;
  await restaurant.save();

  return ok(res, { logoUrl: restaurant.logoUrl }, "Logo uploaded");
});

// POST /api/owner/restaurants/:id/covers (multiple files)
const uploadCovers = asyncHandler(async (req, res) => {
  const restaurant = req.restaurant;
  const files = req.files || [];
  if (!files.length) throw new AppError("Files are required (field name: files)", 400);

  const urls = [];
  for (const f of files) {
    const uploaded = await uploadBufferToCloudinary(f.buffer, {
      folder: `${env.CLOUDINARY_FOLDER}/restaurants/${restaurant.slug}/covers`
    });
    urls.push(uploaded.secure_url);
  }

  restaurant.coverUrls.push(...urls);
  await restaurant.save();

  return ok(res, { coverUrls: restaurant.coverUrls }, "Covers uploaded");
});

module.exports = { createRestaurant, updateRestaurant, uploadLogo, uploadCovers };
