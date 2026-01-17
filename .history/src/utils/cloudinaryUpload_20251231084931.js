// File: src/utils/cloudinaryUpload.js
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const { env } = require("../config/env");

function uploadBufferToCloudinary(buffer, opts = {}) {
  const folder = opts.folder || env.CLOUDINARY_FOLDER || "syrian-qr-menu";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
