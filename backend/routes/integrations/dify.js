const express = require("express");
const router = express.Router();
const { getAiReply } = require("../../services/aiAgent");
const { requireAuth } = require("../../middleware/auth");

// Lets the Settings UI "Test connection" button verify Dify/custom AI agent credentials
// before saving them against an inbox.
router.post("/test", requireAuth, async (req, res) => {
  const { provider, endpoint, apiKey } = req.body;
  try {
    const reply = await getAiReply(
      { provider, endpoint, apiKey, autoReply: true },
      "Hello, this is a connection test.",
      "test-connection"
    );
    res.json({ ok: true, reply });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.response?.data || err.message });
  }
});

module.exports = router;
