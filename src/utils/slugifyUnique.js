// File: src/utils/slugifyUnique.js
const slugify = require("slugify");

/**
 * يولّد slug فريد داخل نفس Model
 * لو الاسم عربي وطلع slug فاضي، نعطي fallback
 */
async function slugifyUnique(Model, name, slugField = "slug") {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  const fallback = `rest-${Math.random().toString(36).slice(2, 8)}`;
  const baseSlug = base && base.length > 0 ? base : fallback;

  let slug = baseSlug;
  let counter = 2;

  // تأكد من عدم وجوده
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await Model.findOne({ [slugField]: slug }).select("_id");
    if (!exists) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = slugifyUnique;
