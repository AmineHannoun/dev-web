const express = require("express");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwt");
const { User } = require("../../models");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

// Helper simple pour valider l'email
function looksLikeEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (!looksLikeEmail(email)) {
      return res.status(400).json({ message: "invalid email" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "password must be at least 6 chars" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    const token = sign({ id: user.id, email: user.email });
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "internal error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    const token = sign({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "internal error" });
  }
});

// GET /auth/me (protégé)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["id", "email", "createdAt"] });
    if (!user) return res.status(404).json({ message: "user not found" });
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "internal error" });
  }
});

module.exports = router;
