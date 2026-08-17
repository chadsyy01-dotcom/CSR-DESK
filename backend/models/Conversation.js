const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Conversation = sequelize.define("Conversation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM("open", "pending", "resolved"),
    defaultValue: "open",
  },
  lastMessageAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastMessagePreview: { type: DataTypes.STRING, defaultValue: "" },
});

module.exports = Conversation;
