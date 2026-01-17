// File: src/utils/openNow.js
const { DateTime } = require("luxon");

/**
 * يحسب "مفتوح الآن" حسب hours.weekly
 * weekly: [{day:0..6,isClosed,open:'09:00',close:'23:00'}]
 */
function isOpenNow(hours) {
  if (!hours || !hours.weekly || hours.weekly.length === 0) return null;

  const tz = hours.timezone || "Asia/Damascus";
  const now = DateTime.now().setZone(tz);

  // Luxon weekday: Mon=1..Sun=7
  const dayIndex = now.weekday % 7; // Sunday=0

  const today = hours.weekly.find((d) => d.day === dayIndex);
  if (!today) return null;
  if (today.isClosed) return false;

  const open = DateTime.fromFormat(today.open, "HH:mm", { zone: tz }).set({
    year: now.year,
    month: now.month,
    day: now.day
  });

  let close = DateTime.fromFormat(today.close, "HH:mm", { zone: tz }).set({
    year: now.year,
    month: now.month,
    day: now.day
  });

  // إذا الإغلاق بعد منتصف الليل
  if (close <= open) close = close.plus({ days: 1 });

  return now >= open && now <= close;
}

module.exports = isOpenNow;

