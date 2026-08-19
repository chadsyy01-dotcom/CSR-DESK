const express = require("express");
const router = express.Router();
const { Conversation, Inbox, Message, Contact } = require("../models");
const { getAiReply } = require("../services/aiAgent");
const { sendToMeta } = require("../services/metaSender");
const { optionalAuth } = require("../middleware/auth");
async function touchConversation(conversation, message) {
  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = message.content.slice(0, 120);
  await conversation.save();
}
// GET messages for a conversation
router.get("/conversation/:conversationId", async (req, res) => {
  const messages = await Message.findAll({
    where: { conversationId: req.params.conversationId },
    order: [["createdAt", "ASC"]],
  });
  res.json(messages);
});
// POST send a message into a conversation
// senderType: "agent" (from dashboard, requires login) or "contact" (from the public widget)
router.post("/conversation/:conversationId", optionalAuth, async (req, res) => {
  const io = req.app.get("io");
  const { conversationId } = req.params;
  const { content, senderType } = req.body;
  let { senderName } = req.body;
  if (!content || !senderType) {
    return res.status(400).json({ error: "content and senderType are required" });
  }
  if (senderType === "agent") {
    if (!req.agent) return res.status(401).json({ error: "Login required to reply as an agent" });
    senderName = req.agent.name;
  }
  const conversation = await Conversation.findByPk(conversationId, {
    include: [Inbox, Contact],
  });
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  if (
    senderType === "contact" &&
    conversation.status === "resolved" &&
    !conversation.Inbox?.widgetConfig?.allowMessagesAfterResolved
  ) {
    return res.status(403).json({
      error: "resolved",
      message: "Nasarado na ang usapang ito. Mag-start ng bagong conversation.",
    });
  }
  const message = await Message.create({
    conversationId,
    content,
    senderType,
    senderName: senderName || conversation.Contact?.name || "Guest",
  });
  await touchConversation(conversation, message);
  io.to(`conversation:${conversationId}`).emit("new_message", message);
  io.emit("conversation_updated", conversation);
  if (senderType === "agent" && conversation.Inbox) {
    sendToMeta(conversation.Inbox, conversation.Contact, content).catch((err) =>
      console.error("Meta send failed:", err.message)
    );
  }
  if (senderType === "contact" && conversation.Inbox) {
    const aiConfig = conversation.Inbox.aiConfig;
    if (aiConfig && aiConfig.provider !== "none" && aiConfig.autoReply) {
      try {
        const aiText = await getAiReply(aiConfig, content, conversationId);
        if (aiText) {
          const botMessage = await Message.create({
            conversationId,
            content: aiText,
            senderType: "bot",
            senderName: "AI Agent",
          });
          await touchConversation(conversation, botMessage);
          io.to(`conversation:${conversationId}`).emit("new_message", botMessage);
          io.emit("conversation_updated", conversation);
          sendToMeta(conversation.Inbox, conversation.Contact, aiText).catch((err) =>
            console.error("Meta send failed:", err.message)
          );
        }
      } catch (err) {
        console.error("AI agent reply failed:", err.message);
      }
    }
  }
  res.status(201).json(message);
});
module.exports = router;
