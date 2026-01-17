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
export function extractCloudinaryPublicId(url) {
  try {
    if (!url) return "";
    const u = new URL(url);
    const afterUpload = u.pathname.split("/upload/")[1];
    if (!afterUpload) return "";

    // ممكن يكون في transformations قبل v123
    const idx = afterUpload.indexOf("/v");
    let path = afterUpload;

    if (idx >= 0) {
      // قص بعد /v123/
      const cut = afterUpload.slice(idx + 1); // يبدأ بـ v123/...
      path = cut.replace(/^v\d+\//, "");
    } else {
      path = afterUpload.replace(/^v\d+\//, "");
    }

    // إزالة الامتداد
    path = path.replace(/\.[a-zA-Z0-9]+$/, "");
    return decodeURIComponent(path);
  } catch {
    return "";
  }
}

export async function deleteCloudinaryByUrl(url) {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;

  // أغلب صورك resource_type image
  await cloudinary.v2.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true
  });
}

export default async function uploadBufferToCloudinary(buffer, options = {}) {
  // نفس كود الرفع عندك بدون تغيير
}
module.exports = { uploadBufferToCloudinary };
