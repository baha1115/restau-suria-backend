// File: src/utils/response.js
function ok(res, data = null, message = "OK") {
  return res.json({ success: true, message, data });
}

function created(res, data = null, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}

module.exports = { ok, created };
