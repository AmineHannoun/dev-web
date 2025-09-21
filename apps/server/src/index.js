require("dotenv").config();
const { createApp } = require("./app");
const { sequelize } = require("../models"); // fourni par sequelize-cli

const app = createApp();
const port = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
    app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
}

start();
