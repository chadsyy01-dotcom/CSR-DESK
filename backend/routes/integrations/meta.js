const express = require("express");
const router = express.Router();
const { Inbox, Contact, Conversation, Message } = require("../../models");
const { getAiReply } = require("../../services/aiAgent");
const { sendToMeta } = require("../../services/metaSender");
const axios = require("axios");

// --- Step 1: Webhook verification (Meta calls this once when you set up the webhook URL) ---
// Configure this same URL in Meta App Dashboard > Webhooks, with the same META_VERIFY_TOKEN.
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// --- Step 2: Receiving events (messages) from Messenger / Instagram / WhatsApp ---
router.post("/webhook", async (req, res) => {
  // Always respond 200 fast so Meta doesn't retry/backoff on you.
  res.sendStatus(200);

  const io = req.app.get("io");
  const body = req.body;

  try {
    if (body.object === "page" || body.object === "instagram") {
      // Messenger / Instagram DM payload shape
      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderPsid = event.sender?.id;
          const text = event.message?.text;
          if (!senderPsid || !text) continue;

          const channelType = body.object === "instagram" ? "instagram" : "facebook";
          await handleIncoming({ channelType, externalId: senderPsid, text, io });
        }
      }
    }

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const messages = change.value?.messages || [];
          for (const msg of messages) {
            const from = msg.from;
            const text = msg.text?.body;
            if (!from || !text) continue;
            await handleIncoming({ channelType: "whatsapp", externalId: from, text, io });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error processing Meta webhook:", err.message);
  }
});

// Finds/creates the matching inbox+contact+conversation, stores the message,
// broadcasts it to the dashboard in real time, and triggers AI auto-reply if enabled.
async function handleIncoming({ channelType, externalId, text, io }) {
  const inbox = await Inbox.findOne({ where: { channelType } });
  if (!inbox) return; // no inbox configured for this channel type yet

  let contact = await Contact.findOne({ where: { externalId } });
  if (!contact) {
    let displayName = `${channelType} user`;
    if (channelType === "facebook" && inbox.settings?.pageAccessToken) {
      try {
        const profile = await axios.get(
          `https://graph.facebook.com/${externalId}`,
          { params: { fields: "name", access_token: inbox.settings.pageAccessToken } }
        );
        if (profile.data?.name) displayName = profile.data.name;
      } catch (err) {
        console.error("Failed to fetch FB profile name:", err.message);
      }
    }
    contact = await Contact.create({ name: displayName, externalId });
  }

  let conversation = await Conversation.findOne({
    where: { inboxId: inbox.id, contactId: contact.id, status: "open" },
  });
  if (!conversation) {
    conversation = await Conversation.create({ inboxId: inbox.id, contactId: contact.id });
  }

  const message = await Message.create({
    conversationId: conversation.id,
    content: text,
    senderType: "contact",
    senderName: contact.name,
  });
  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = text.slice(0, 120);
  await conversation.save();

  io.to(`conversation:${conversation.id}`).emit("new_message", message);
  io.emit("conversation_updated", conversation);
  io.emit("new_conversation", conversation);

  const aiConfig = inbox.aiConfig;
  if (aiConfig?.provider !== "none" && aiConfig?.autoReply) {
    const aiText = await getAiReply(aiConfig, text, conversation.id);
    if (aiText) {
      const botMessage = await Message.create({
        conversationId: conversation.id,
        content: aiText,
        senderType: "bot",
        senderName: "AI Agent",
      });
      conversation.lastMessageAt = new Date();
      conversation.lastMessagePreview = aiText.slice(0, 120);
      await conversation.save();

      io.to(`conversation:${conversation.id}`).emit("new_message", botMessage);
      io.emit("conversation_updated", conversation);

      await sendToMeta(inbox, contact, aiText);
    }
  }
}

module.exports = router;