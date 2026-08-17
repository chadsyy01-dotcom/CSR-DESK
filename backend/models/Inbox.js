const { DataTypes } = require("sequelize");
const sequelize = require("../db");

// An Inbox = a connected channel (Website widget, Messenger, Instagram, WhatsApp, Email...)
const Inbox = sequelize.define("Inbox", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  channelType: {
    type: DataTypes.ENUM(
      "website",
      "facebook",
      "instagram",
      "whatsapp",
      "email"
    ),
    allowNull: false,
    defaultValue: "website",
  },
  // Free-form JSON for channel-specific settings (page id, tokens ref, widget color, etc.)
  settings: {
    type: DataTypes.TEXT,
    defaultValue: "{}",
    get() {
      const raw = this.getDataValue("settings");
      try {
        return JSON.parse(raw || "{}");
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue("settings", JSON.stringify(value || {}));
    },
  },
  // AI agent config per inbox: which provider (dify / custom / none) + endpoint/key + auto-reply toggle
  aiConfig: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify({
      provider: "none",
      endpoint: "",
      apiKey: "",
      autoReply: false,
    }),
    get() {
      const raw = this.getDataValue("aiConfig");
      try {
        return JSON.parse(raw || "{}");
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue("aiConfig", JSON.stringify(value || {}));
    },
  },
});

module.exports = Inbox;
