const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev_secret";

function sign(payload, options = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d", ...options });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
