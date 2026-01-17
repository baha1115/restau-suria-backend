// File: src/utils/whatsapp.js
function normalizeWhatsappNumber(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/[^\d+]/g, ""); // أزل المسافات والرموز

  // remove +
  s = s.replace(/^\+/, "");

  // 00 -> remove
  if (s.startsWith("00")) s = s.slice(2);

  // لو رقم سوري محلي يبدأ 0
  if (s.startsWith("0")) {
    s = "963" + s.slice(1);
  }

  // إذا المستخدم كتب 9xxxxxx بدون 0
  if (s.length === 9 && s.startsWith("9")) {
    s = "963" + s;
  }

  return s;
}

function buildWhatsappUrl(whatsappNumber, message) {
  const num = normalizeWhatsappNumber(whatsappNumber);
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${num}?text=${text}`;
}

function buildOrderMessage({ restaurantName, tableNumber, items = [], notes = "" }) {
  const lines = [];
  lines.push(`مرحبا 🌟`);
  lines.push(`هذا طلبي من ${restaurantName}:`);
  lines.push("");

  items.forEach((it) => {
    const qty = it.qty || 1;
    lines.push(`- ${it.name} × ${qty}`);
    if (it.options && it.options.length) {
      lines.push(`  إضافات/ملاحظات: ${it.options.join("، ")}`);
    }
  });

  lines.push("");

  if (tableNumber) lines.push(`رقم الطاولة: ${tableNumber}`);
  if (notes) lines.push(`ملاحظات: ${notes}`);

  return lines.join("\n");
}

module.exports = { normalizeWhatsappNumber, buildWhatsappUrl, buildOrderMessage };
