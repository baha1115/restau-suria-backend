// File: src/validations/restaurant.validation.js
const Joi = require("joi");

const hoursDay = Joi.object({
  day: Joi.number().integer().min(0).max(6).required(),
  isClosed: Joi.boolean().optional(),
  open: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  close: Joi.string().pattern(/^\d{2}:\d{2}$/).optional()
});

const createRestaurantSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  city: Joi.string().min(2).max(80).required(),
  type: Joi.string().min(2).max(80).required(),
  whatsapp: Joi.string().min(5).max(30).required(),
  phone: Joi.string().allow("").max(30),
  addressText: Joi.string().allow("").max(200),

  location: Joi.object({
    lat: Joi.number().allow(null),
    lng: Joi.number().allow(null)
  }).optional(),

  hours: Joi.object({
    timezone: Joi.string().optional(),
    weekly: Joi.array().items(hoursDay).optional()
  }).optional(),

  deliveryEnabled: Joi.boolean().optional(),
  pickupEnabled: Joi.boolean().optional()
});

const updateRestaurantSchema = createRestaurantSchema.fork(
  ["name", "city", "type", "whatsapp"],
  (s) => s.optional()
);

module.exports = { createRestaurantSchema, updateRestaurantSchema };
