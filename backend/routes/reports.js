const express = require("express");
const router = express.Router();
const { Conversation, Message, Inbox, Agent } = require("../models");
const { Op, fn, col } = require("sequelize");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

// GET overview stats: totals + conversations by status + messages by sender type + per-channel counts
router.get("/overview", async (req, res) => {
  const totalConversations = await Conversation.count();
  const openConversations = await Conversation.count({ where: { status: "open" } });
  const pendingConversations = await Conversation.count({ where: { status: "pending" } });
  const resolvedConversations = await Conversation.count({ where: { status: "resolved" } });
  const totalMessages = await Message.count();
  const totalAgents = await Agent.count();

  const messagesBySender = await Message.findAll({
    attributes: ["senderType", [fn("COUNT", col("id")), "count"]],
    group: ["senderType"],
    raw: true,
  });

  const conversationsByInbox = await Conversation.findAll({
    attributes: ["inboxId", [fn("COUNT", col("Conversation.id")), "count"]],
    include: [{ model: Inbox, attributes: ["name", "channelType"] }],
    group: ["inboxId", "Inbox.id"],
    raw: true,
    nest: true,
  });

  // Conversations created per day, last 7 days (simple volume trend)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const recentConversations = await Conversation.findAll({
    attributes: ["createdAt"],
    where: { createdAt: { [Op.gte]: sevenDaysAgo } },
    raw: true,
  });
  const volumeByDay = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    volumeByDay[d.toISOString().slice(0, 10)] = 0;
  }
  recentConversations.forEach((c) => {
    const day = new Date(c.createdAt).toISOString().slice(0, 10);
    if (volumeByDay[day] !== undefined) volumeByDay[day]++;
  });

  res.json({
    totals: {
      conversations: totalConversations,
      open: openConversations,
      pending: pendingConversations,
      resolved: resolvedConversations,
      messages: totalMessages,
      agents: totalAgents,
    },
    messagesBySender,
    conversationsByInbox,
    volumeByDay,
  });
});

module.exports = router;
