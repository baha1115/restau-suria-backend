// File: src/validations/auth.validation.js
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

// Forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// Reset password
const resetPasswordSchema = Joi.object({
  token: Joi.string().min(20).required(),
  newPassword: Joi.string().min(6).max(100).required()
});
module.exports = { registerSchema, loginSchema,forgotPasswordSchema,resetPasswordSchema };
