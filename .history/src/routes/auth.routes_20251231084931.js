// File: src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { authOptional, authMiddleware } = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/rateLimit");

const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

router.post("/register", authLimiter, authOptional, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
