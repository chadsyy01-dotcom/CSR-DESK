const express = require("express");
const router = express.Router();
const { Contact, Conversation } = require("../models");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", async (req, res) => {
  const contacts = await Contact.findAll({
    include: [{ model: Conversation, attributes: ["id"] }],
    order: [["createdAt", "DESC"]],
  });
  const result = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    externalId: c.externalId,
    conversationCount: c.Conversations ? c.Conversations.length : 0,
  }));
  res.json(result);
});

module.exports = router;