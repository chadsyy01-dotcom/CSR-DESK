require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { sequelize } = require("./models");
const attachSocket = require("./socket");

const authRoutes = require("./routes/auth");
const agentsRoutes = require("./routes/agents");
const inboxesRoutes = require("./routes/inboxes");
const conversationsRoutes = require("./routes/conversations");
const messagesRoutes = require("./routes/messages");
const reportsRoutes = require("./routes/reports");
const metaRoutes = require("./routes/integrations/meta");
const difyRoutes = require("./routes/integrations/dify");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});

app.set("io", io);
attachSocket(io);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serves /widget.js (and any other static assets) - this is what sites embed to get the chat bubble
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/inboxes", inboxesRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/integrations/meta", metaRoutes);
app.use("/api/integrations/dify", difyRoutes);

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Chatwoot-clone backend running on http://localhost:${PORT}`);
  });
});
