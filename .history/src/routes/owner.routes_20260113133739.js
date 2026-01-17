// File: src/routes/owner.routes.js
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/roles");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");

const { requireRestaurantOwnership, requireResourceOwnership } = require("../middlewares/ownership");

const MenuSection = require("../models/MenuSection");
const MenuItem = require("../models/MenuItem");
const Offer = require("../models/Offer");

const ownerRestaurantController = require("../controllers/owner.restaurant.controller");
const ownerMenuController = require("../controllers/owner.menu.controller");
const ownerOfferController = require("../controllers/owner.offer.controller");
const ownerTableController = require("../controllers/owner.table.controller");

const { createRestaurantSchema, updateRestaurantSchema } = require("../validations/restaurant.validation");
const { createSectionSchema, updateSectionSchema, createItemSchema, updateItemSchema, availabilitySchema } = require("../validations/menu.validation");
const { createOfferSchema, updateOfferSchema } = require("../validations/offer.validation");
const { bulkCreateTablesSchema } = require("../validations/table.validation");

// كل owner routes محمية
router.use(authMiddleware, roleMiddleware("owner", "admin"));

// Restaurants
router.post("/restaurants", validate({ body: createRestaurantSchema }), ownerRestaurantController.createRestaurant);

router.put("/restaurants/:id", requireRestaurantOwnership, validate({ body: updateRestaurantSchema }), ownerRestaurantController.updateRestaurant);

// Uploads
router.post("/restaurants/:id/logo", requireRestaurantOwnership, upload.single("file"), ownerRestaurantController.uploadLogo);
router.post("/restaurants/:id/covers", requireRestaurantOwnership, upload.array("files", 10), ownerRestaurantController.uploadCovers);

// Sections
router.post("/restaurants/:id/sections", requireRestaurantOwnership, validate({ body: createSectionSchema }), ownerMenuController.createSection);

router.put("/sections/:sectionId", requireResourceOwnership(MenuSection, "sectionId"), validate({ body: updateSectionSchema }), ownerMenuController.updateSection);
router.patch("/sections/:sectionId/toggle", requireResourceOwnership(MenuSection, "sectionId"), ownerMenuController.toggleSection);
router.delete("/sections/:sectionId", requireResourceOwnership(MenuSection, "sectionId"), ownerMenuController.deleteSection);

// Items
router.post("/restaurants/:id/items", requireRestaurantOwnership, validate({ body: createItemSchema }), ownerMenuController.createItem);

router.put("/items/:itemId", requireResourceOwnership(MenuItem, "itemId"), validate({ body: updateItemSchema }), ownerMenuController.updateItem);
router.patch("/items/:itemId/availability", requireResourceOwnership(MenuItem, "itemId"), validate({ body: availabilitySchema }), ownerMenuController.updateAvailability);
router.delete("/items/:itemId", requireResourceOwnership(MenuItem, "itemId"), ownerMenuController.deleteItem);

// ✅ NEW: Upload item image
router.post(
  "/offers/:offerId/image",
  requireOwner,
  requireResourceOwnership("Offer", "offerId", "owner"),
  upload.single("file"),
  ownerOfferCtrl.uploadOfferImage
);

// owner.routes.js
router.delete("/restaurants/:restaurantId/logo", ownerRestaurantController.deleteLogo);

// حذف cover واحدة عبر body: { url }
router.delete("/restaurants/:restaurantId/covers", ownerRestaurantController.deleteCover);

// Offers
router.post("/restaurants/:id/offers", requireRestaurantOwnership, validate({ body: createOfferSchema }), ownerOfferController.createOffer);

router.put("/offers/:offerId", requireResourceOwnership(Offer, "offerId"), validate({ body: updateOfferSchema }), ownerOfferController.updateOffer);
router.delete("/offers/:offerId", requireResourceOwnership(Offer, "offerId"), ownerOfferController.deleteOffer);
router.post(
  "/offers/:offerId/image",
  requireResourceOwnership(Offer, "offerId"),
  upload.single("file"),
  ownerOfferController.uploadOfferImage
);
// قبل POST offers أو بجانبه
router.get(
  "/restaurants/:id/offers",
  requireRestaurantOwnership, // نفس الميدلوير الذي تستخدمه للـ restaurant
  ownerOfferController.listOffers
);

// Tables + QR
router.post("/restaurants/:id/tables/bulk", requireRestaurantOwnership, validate({ body: bulkCreateTablesSchema }), ownerTableController.bulkCreateTables);
router.get("/restaurants/:id/tables", requireRestaurantOwnership, ownerTableController.listTables);
router.get("/restaurants/:id/qr", requireRestaurantOwnership, ownerTableController.qrForTable);

module.exports = router;
