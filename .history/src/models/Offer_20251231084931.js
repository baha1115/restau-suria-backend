// File: src/models/Offer.js
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
