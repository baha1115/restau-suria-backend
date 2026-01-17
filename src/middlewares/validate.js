// File: src/middlewares/validate.js
const AppError = require("../utils/AppError");

/**
 * validate({ body, query, params })
 * schema = { body?:JoiSchema, query?:JoiSchema, params?:JoiSchema }
 */
function validate(schema) {
  return (req, res, next) => {
    const toValidate = ["body", "query", "params"];
    for (const key of toValidate) {
      if (!schema[key]) continue;

      const { error, value } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map((d) => d.message);
        return next(new AppError("Validation error", 400, details));
      }

      req[key] = value;
    }

    next();
  };
}

module.exports = validate;
