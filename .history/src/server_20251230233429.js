// File: src/server.js
const { env } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

(async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${env.PORT}`);
  });
})();
