// File: src/validations/offer.validation.js
const Joi = require("joi");

const createOfferSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  description: Joi.string().allow("").max(500).optional(),
  startAt: Joi.date().required(),
  endAt: Joi.date().required()
});

const updateOfferSchema = createOfferSchema.fork(["title", "startAt", "endAt"], (s) => s.optional());

module.exports = { createOfferSchema, updateOfferSchema };
