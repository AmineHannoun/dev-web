const { verify } = require("../utils/jwt");

module.exports = function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" "); // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = verify(token); // { id, email, iat, exp }
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
