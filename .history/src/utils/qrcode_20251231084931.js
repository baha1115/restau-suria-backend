// File: src/utils/qrcode.js
const QRCode = require("qrcode");

async function qrToPngBuffer(text) {
  return QRCode.toBuffer(text, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512
  });
}

module.exports = { qrToPngBuffer };
