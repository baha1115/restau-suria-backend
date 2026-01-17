// File: src/models/Restaurant.js
const mongoose = require("mongoose");

const hoursDaySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday ... 6=Saturday
    isClosed: { type: Boolean, default: false },
    open: { type: String, default: "09:00" },  // HH:mm
    close: { type: String, default: "23:00" }  // HH:mm
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, unique: true, required: true },

    city: { type: String, trim: true, required: true },
    type: { type: String, trim: true, required: true },

    whatsapp: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
    addressText: { type: String, trim: true, default: "" },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },

    hours: {
      timezone: { type: String, default: "Asia/Damascus" },
      weekly: { type: [hoursDaySchema], default: [] }
    },

    logoUrl: { type: String, default: "" },
    coverUrls: { type: [String], default: [] },

    isFeatured: { type: Boolean, default: false },
    deliveryEnabled: { type: Boolean, default: false },
    pickupEnabled: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
