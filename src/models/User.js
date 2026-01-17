// File: src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["owner", "admin"], default: "owner" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },

    isActive: { type: Boolean, default: true },
    // Forgot/Reset password
    // نخزّن HASH فقط (أكثر أماناً)
    resetPasswordTokenHash: { type: String, default: null, select: false },
    resetPasswordExpiresAt: { type: Date, default: null, select: false }
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
