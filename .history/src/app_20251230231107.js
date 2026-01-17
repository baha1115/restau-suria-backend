// File: src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");
const ownerRoutes = require("./routes/owner.routes");
const adminRoutes = require("./routes/admin.routes");
const qrRoutes = require("./routes/qr.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ success: true, message: "Syrian QR Menu API ✅" }));

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/qr", qrRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
