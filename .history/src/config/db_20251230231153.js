// File: src/config/db.js
const mongoose = require("mongoose");
const { env } = require("./env");

module.exports = async function connectDB() {
  if (!env.MONGO_URI) throw new Error("❌ MONGO_URI is missing in .env");

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ MongoDB connected");
};
