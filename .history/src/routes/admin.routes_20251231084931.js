// File: src/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/roles");
const validate = require("../middlewares/validate");
const Joi = require("joi");

const adminController = require("../controllers/admin.controller");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/restaurants", adminController.listRestaurantsAdmin);

router.patch(
  "/restaurants/:id/activate",
  validate({ body: Joi.object({ isActive: Joi.boolean().required() }) }),
  adminController.activateRestaurant
);

router.patch(
  "/restaurants/:id/feature",
  validate({ body: Joi.object({ isFeatured: Joi.boolean().required() }) }),
  adminController.featureRestaurant
);

router.get("/users", adminController.listUsers);

router.post(
  "/owners",
  validate({
    body: Joi.object({
      name: Joi.string().min(2).max(80).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required()
    })
  }),
  adminController.createOwner
);

router.patch(
  "/users/:id/activate",
  validate({ body: Joi.object({ isActive: Joi.boolean().required() }) }),
  adminController.activateUser
);

module.exports = router;
