require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { sequelize, Agent, Inbox } = require("./models");
const attachSocket = require("./socket");
const { execSync } = require("child_process");
const authRoutes = require("./routes/auth");
const agentsRoutes = require("./routes/agents");
const inboxesRoutes = require("./routes/inboxes");
const conversationsRoutes = require("./routes/conversations");
const messagesRoutes = require("./routes/messages");
const reportsRoutes = require("./routes/reports");
const contactsRoutes = require("./routes/contacts");
const metaRoutes = require("./routes/integrations/meta");
const difyRoutes = require("./routes/integrations/dify");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io);
attachSocket(io);
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
// Serves /widget.js (and any other static assets) - this is what sites embed to get the chat bubble
app.use(express.static("public"));

// Public endpoint — no auth. widget.js fetches this to render its appearance/text.
app.get("/api/public/inboxes/:id/widget-config", async (req, res) => {
  const inbox = await Inbox.findByPk(req.params.id);
  if (!inbox) return res.status(404).json({ error: "Inbox not found" });
  res.json(inbox.widgetConfig);
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/inboxes", inboxesRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/integrations/meta", metaRoutes);
app.use("/api/integrations/dify", difyRoutes);
const PORT = process.env.PORT || 4000;
sequelize.sync().then(async () => {
  const agentCount = await Agent.count();
  if (agentCount === 0) {
    console.log("Empty database detected, running seed...");
    try {
      execSync("node seed.js", { stdio: "inherit" });
    } catch (err) {
      console.error("Seed failed:", err.message);
    }
  }
  server.listen(PORT, () => {
    console.log(`Chatwoot-clone backend running on http://localhost:${PORT}`);
  });
});
