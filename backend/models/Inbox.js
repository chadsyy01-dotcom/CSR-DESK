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
  // Widget appearance config: colors, text, position, size — editable from the dashboard
  widgetConfig: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify({
      brandName: "Chat with us",
      welcomeText: "Kumusta! Paano ka namin matutulungan ngayon?",
      statusText: "Nandito kami",
      footnoteText: "Karaniwang sumasagot sa loob ng ilang minuto",
      accentColor: "#E8A33D",
      bgColor: "#1B2129",
      messagesBgColor: "#12151A",
      teal: "#5CC8C2",
      position: "bottom-right",
      size: "medium",
      chips: [
        { label: "I-track ang order", msg: "Gusto kong i-track ang order ko" },
        { label: "Billing", msg: "May tanong ako tungkol sa billing" },
        { label: "Mag-report ng issue", msg: "May issue akong na-encounter" },
      ],
    }),
    get() {
      const raw = this.getDataValue("widgetConfig");
      try {
        return JSON.parse(raw || "{}");
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue("widgetConfig", JSON.stringify(value || {}));
    },
  },
});

module.exports = Inbox;
