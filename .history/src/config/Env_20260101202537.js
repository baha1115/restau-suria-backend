// File: src/config/env.js
const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  ALLOW_PUBLIC_REGISTER: process.env.ALLOW_PUBLIC_REGISTER === "true",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "syrian-qr-menu",

  NTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "Syrian QR Menu <no-reply@syrianmenu.com>",
  RESET_PASSWORD_EXPIRES_MIN: Number(process.env.RESET_PASSWORD_EXPIRES_MIN || 15),
  ADMIN_EMAILS:process.env.ADMIN_EMAILS
};

module.exports = { env };
