// File: src/validations/menu.validation.js
const Joi = require("joi");

const createSectionSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  sortOrder: Joi.number().integer().optional()
});

const updateSectionSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  sortOrder: Joi.number().integer().optional()
});

const optionSchema = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  price: Joi.number().min(0).optional()
});

const createItemSchema = Joi.object({
  sectionId: Joi.string().required(),
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().allow("").max(500).optional(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().max(10).optional(),
  sortOrder: Joi.number().integer().optional(),
  isAvailable: Joi.boolean().optional(),
  options: Joi.array().items(optionSchema).optional()
});

const updateItemSchema = createItemSchema.fork(
  ["sectionId", "name", "price"],
  (s) => s.optional()
);

const availabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required()
});

module.exports = {
  createSectionSchema,
  updateSectionSchema,
  createItemSchema,
  updateItemSchema,
  availabilitySchema
};
