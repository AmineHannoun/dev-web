const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const todosRouter = require("./routes/todos");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/todos", todosRouter);

  return app;
}

module.exports = { createApp };
