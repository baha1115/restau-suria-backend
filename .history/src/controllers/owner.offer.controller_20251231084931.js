// File: src/controllers/owner.offer.controller.js
const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

// POST /api/owner/restaurants/:id/offers
const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create({
    restaurantId: req.restaurant._id,
    title: req.body.title,
    description: req.body.description || "",
    startAt: req.body.startAt,
    endAt: req.body.endAt
  });

  return created(res, { offer }, "Offer created");
});

// PUT /api/owner/offers/:offerId
const updateOffer = asyncHandler(async (req, res) => {
  const offer = req.resource;

  const allowed = ["title", "description", "startAt", "endAt", "isActive"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) offer[k] = req.body[k];
  });

  await offer.save();
  return ok(res, { offer }, "Offer updated");
});

// DELETE /api/owner/offers/:offerId (soft)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = req.resource;
  offer.isActive = false;
  await offer.save();
  return ok(res, { offerId: offer._id }, "Offer deleted (soft)");
});

module.exports = { createOffer, updateOffer, deleteOffer };
