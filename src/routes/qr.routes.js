// File: src/routes/qr.routes.js
const express = require("express");
const router = express.Router();

const qrController = require("../controllers/qr.controller");

router.get("/:slug", qrController.publicQr);

module.exports = router;
