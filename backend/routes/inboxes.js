const express = require("express");
const router = express.Router();
const { Inbox } = require("../models");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

// GET all inboxes/channels
router.get("/", async (req, res) => {
  const inboxes = await Inbox.findAll({ order: [["createdAt", "ASC"]] });
  res.json(inboxes);
});

// POST create a new inbox/channel
router.post("/", async (req, res) => {
  try {
    const { name, channelType, settings } = req.body;
    if (!name || !channelType) {
      return res.status(400).json({ error: "name and channelType are required" });
    }
    const inbox = await Inbox.create({ name, channelType, settings: settings || {} });
    res.status(201).json(inbox);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET single inbox
router.get("/:id", async (req, res) => {
  const inbox = await Inbox.findByPk(req.params.id);
  if (!inbox) return res.status(404).json({ error: "Inbox not found" });
  res.json(inbox);
});

// PATCH update inbox settings (also used for connecting Meta credentials, toggling AI agent, widget appearance)
router.patch("/:id", async (req, res) => {
  const inbox = await Inbox.findByPk(req.params.id);
  if (!inbox) return res.status(404).json({ error: "Inbox not found" });
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.settings) updates.settings = { ...inbox.settings, ...req.body.settings };
  if (req.body.aiConfig) updates.aiConfig = { ...inbox.aiConfig, ...req.body.aiConfig };
  if (req.body.widgetConfig) updates.widgetConfig = { ...inbox.widgetConfig, ...req.body.widgetConfig };
  await inbox.update(updates);
  res.json(inbox);
});

// DELETE inbox
router.delete("/:id", async (req, res) => {
  const inbox = await Inbox.findByPk(req.params.id);
  if (!inbox) return res.status(404).json({ error: "Inbox not found" });
  await inbox.destroy();
  res.status(204).end();
});

module.exports = router;
