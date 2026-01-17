// File: src/models/MenuItem.js
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuSection", required: true },

    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true },
    currency: { type: String, default: "SYP" },

    imageUrl: { type: String, default: "" },

    isAvailable: { type: Boolean, default: true }, // غير متوفر اليوم؟
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    options: { type: [optionSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
