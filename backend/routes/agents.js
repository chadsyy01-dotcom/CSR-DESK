const express = require("express");
const router = express.Router();
const { Agent } = require("../models");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

// GET all agents
router.get("/", async (req, res) => {
  const agents = await Agent.findAll({ order: [["createdAt", "ASC"]] });
  res.json(agents);
});

// POST create agent
router.post("/", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    const agent = await Agent.create({
      name,
      email,
      role: role || "agent",
      passwordHash: Agent.hashPassword(password),
    });
    res.status(201).json(agent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update agent
router.patch("/:id", async (req, res) => {
  const agent = await Agent.findByPk(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const updates = { ...req.body };
  if (updates.password) {
    updates.passwordHash = Agent.hashPassword(updates.password);
    delete updates.password;
  }
  await agent.update(updates);
  res.json(agent);
});

// DELETE agent
router.delete("/:id", async (req, res) => {
  const agent = await Agent.findByPk(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  await agent.destroy();
  res.status(204).end();
});

module.exports = router;
