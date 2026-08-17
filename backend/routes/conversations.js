const express = require("express");
const router = express.Router();
const { Conversation, Inbox, Contact, Message, Agent } = require("../models");
const { requireAuth } = require("../middleware/auth");

// GET all conversations (dashboard only - lists everyone's conversations)
router.get("/", requireAuth, async (req, res) => {
  const where = {};
  if (req.query.inboxId) where.inboxId = req.query.inboxId;
  if (req.query.status) where.status = req.query.status;

  const conversations = await Conversation.findAll({
    where,
    include: [Inbox, Contact, { model: Agent, as: "assignedAgent" }],
    order: [["lastMessageAt", "DESC"]],
  });
  res.json(conversations);
});

// GET single conversation with its messages (dashboard only)
router.get("/:id", requireAuth, async (req, res) => {
  const conversation = await Conversation.findByPk(req.params.id, {
    include: [Inbox, Contact, { model: Agent, as: "assignedAgent" }, Message],
  });
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  res.json(conversation);
});

// POST create a new conversation - PUBLIC (the website widget calls this when a visitor
// starts chatting, without being logged in as an agent)
router.post("/", async (req, res) => {
  try {
    const { inboxId, contactName, contactEmail } = req.body;
    if (!inboxId) return res.status(400).json({ error: "inboxId is required" });

    const inbox = await Inbox.findByPk(inboxId);
    if (!inbox) return res.status(404).json({ error: "Inbox not found" });

    const contact = await Contact.create({
      name: contactName || "Guest",
      email: contactEmail || null,
    });

    const conversation = await Conversation.create({
      inboxId,
      contactId: contact.id,
      status: "open",
    });

    const full = await Conversation.findByPk(conversation.id, {
      include: [Inbox, Contact, { model: Agent, as: "assignedAgent" }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update conversation (status, assign agent) - dashboard only
router.patch("/:id", requireAuth, async (req, res) => {
  const conversation = await Conversation.findByPk(req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.assignedAgentId !== undefined) updates.assignedAgentId = req.body.assignedAgentId;
  await conversation.update(updates);
  res.json(conversation);
});

module.exports = router;
