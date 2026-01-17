// File: src/models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    number: { type: Number, required: true }, // 1..N
    label: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
