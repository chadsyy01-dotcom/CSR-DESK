const axios = require("axios");

/**
 * Get a reply from the configured AI agent for a given inbox.
 * Supports two provider types:
 *  - "dify": calls Dify's Chat Messages API (https://docs.dify.ai)
 *  - "custom": calls any webhook you point it to, POSTing { message, conversationId }
 *              and expecting back { reply: "..." }
 *
 * aiConfig shape (stored per-inbox, editable in Settings):
 *  { provider: "dify" | "custom" | "none", endpoint: string, apiKey: string, autoReply: boolean }
 */
async function getAiReply(aiConfig, userMessage, conversationId) {
  if (!aiConfig || aiConfig.provider === "none") return null;

  if (aiConfig.provider === "dify") {
    const url = `${aiConfig.endpoint || "https://api.dify.ai/v1"}/chat-messages`;
    const response = await axios.post(
      url,
      {
        inputs: {},
        query: userMessage,
        response_mode: "blocking",
        conversation_id: "", // Dify manages its own conversation state; keep simple for MVP
        user: conversationId,
      },
      {
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );
    return response.data?.answer || null;
  }

  if (aiConfig.provider === "custom") {
    const response = await axios.post(
      aiConfig.endpoint,
      { message: userMessage, conversationId },
      {
        headers: {
          Authorization: aiConfig.apiKey ? `Bearer ${aiConfig.apiKey}` : undefined,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );
    return response.data?.reply || null;
  }

  return null;
}

module.exports = { getAiReply };
