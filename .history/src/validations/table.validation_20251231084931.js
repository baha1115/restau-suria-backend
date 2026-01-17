// File: src/validations/table.validation.js
const Joi = require("joi");

const bulkCreateTablesSchema = Joi.object({
  from: Joi.number().integer().min(1).required(),
  to: Joi.number().integer().min(1).required()
});

module.exports = { bulkCreateTablesSchema };
