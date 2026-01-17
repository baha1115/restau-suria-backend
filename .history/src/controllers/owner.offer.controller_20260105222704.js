const Offer = require("../models/Offer");

// Cloudinary (محاولة توافق مع مشروعك)
let cloudinary;
try {
  cloudinary = require("../config/cloudinary");
  cloudinary = cloudinary?.v2 || cloudinary?.cloudinary || cloudinary;
} catch (e) {
  cloudinary = require("cloudinary").v2;
}

function toISO(d) {
  const x = new Date(d);
  return isNaN(x.getTime()) ? null : x.toISOString();
}

/**
 * POST /api/owner/restaurants/:restaurantId/offers
 * body: { title, description?, startAt, endAt }
 * NOTE: requireRestaurantOwnership يضع req.restaurant
 */
exports.createOffer = async (req, res, next)=> {
  try {
    const restaurantId = req.params.restaurantId || req.params.id; // ✅ important
    const { title, description, startAt, endAt } = req.body;

    const offer = await Offer.create({
      restaurantId,
      title,
      description,
      startAt,
      endAt
    });

    return res.json({ success: true, data: { offer } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/owner/offers/:offerId
 * NOTE: requireResourceOwnership يضع req.resource
 */
exports.updateOffer = async (req, res, next) => {
  try {
    const offer = req.resource;
    const { title, description, startAt, endAt } = req.body;

    offer.title = title?.trim();
    offer.description = description || "";
    offer.startAt = toISO(startAt);
    offer.endAt = toISO(endAt);

    await offer.save();

    return res.json({ success: true, data: { offer } });
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /api/owner/offers/:offerId
 */
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = req.resource;

    offer.isDeleted = true;
    await offer.save();

    return res.json({ success: true, data: { ok: true } });
  } catch (err) {
    return next(err);
  }
};

/**
 * ✅ NEW
 * POST /api/owner/offers/:offerId/image
 * multipart/form-data: file=<image>
 */
exports.uploadOfferImage = async (req, res, next) => {
  try {
    const offer = req.resource;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    // احذف القديمة إذا موجودة
    if (offer.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(offer.imagePublicId);
      } catch {
        // تجاهل
      }
    }

    // رفع بدون streamifier (Data URI)
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "syrian-qr-menu/offers",
      resource_type: "image"
    });

    offer.imageUrl = result.secure_url || result.url || "";
    offer.imagePublicId = result.public_id || "";
    await offer.save();

    return res.json({ success: true, data: { offer } });
  } catch (err) {
    return next(err);
  }
};
