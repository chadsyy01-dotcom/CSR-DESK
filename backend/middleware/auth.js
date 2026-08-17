const jwt = require("jsonwebtoken");
const { Agent } = require("../models");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findByPk(payload.id);
    if (!agent) return res.status(401).json({ error: "Invalid token" });
    req.agent = agent;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Attaches req.agent if a valid token is present, but doesn't block the request otherwise.
// Used on routes shared between the public widget and the authenticated dashboard.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findByPk(payload.id);
    if (agent) req.agent = agent;
  } catch (err) {
    // ignore invalid token on optional routes
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
