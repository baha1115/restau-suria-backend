// File: src/routes/public.routes.js
const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const publicController = require("../controllers/public.controller");
const { listRestaurantsQuery, searchQuery, menuQuery, whatsappMessageSchema } = require("../validations/public.validation");

router.get("/home", publicController.home);

router.get("/restaurants", validate({ query: listRestaurantsQuery }), publicController.listRestaurants);
router.get("/search", validate({ query: searchQuery }), publicController.search);

router.get("/r/:slug", publicController.getRestaurantBySlug);
router.get("/r/:slug/menu", validate({ query: menuQuery }), publicController.getMenuBySlug);

router.get("/offers", publicController.listOffers);

router.post("/whatsapp-message", validate({ body: whatsappMessageSchema }), publicController.whatsappMessage);

module.exports = router;
