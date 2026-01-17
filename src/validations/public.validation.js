// File: src/validations/public.validation.js
const Joi = require("joi");

const listRestaurantsQuery = Joi.object({
  city: Joi.string().allow("").optional(),
  type: Joi.string().allow("").optional(),
  openNow: Joi.string().allow("").optional(), // "true" or "false"
  delivery: Joi.string().allow("").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional()
});

const searchQuery = Joi.object({
  q: Joi.string().min(1).max(100).required()
});

const menuQuery = Joi.object({
  q: Joi.string().allow("").max(100).optional()
});

const whatsappMessageSchema = Joi.object({
  slug: Joi.string().required(),
  tableNumber: Joi.number().integer().min(1).allow(null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        qty: Joi.number().integer().min(1).default(1),
        options: Joi.array().items(Joi.string().max(100)).optional()
      })
    )
    .min(1)
    .required(),
  notes: Joi.string().allow("").max(300).optional()
});

module.exports = { listRestaurantsQuery, searchQuery, menuQuery, whatsappMessageSchema };
