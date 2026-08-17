const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { Agent } = require("../models");
const { requireAuth } = require("../middleware/auth");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const agent = await Agent.scope("withPassword").findOne({ where: { email } });
  if (!agent || !agent.checkPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: agent.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const { passwordHash, ...safeAgent } = agent.toJSON();
  res.json({ token, agent: safeAgent });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(req.agent);
});

module.exports = router;
