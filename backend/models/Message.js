const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: { type: DataTypes.TEXT, allowNull: false },
  // who sent it: contact (customer), agent (human), or bot (AI agent reply)
  senderType: {
    type: DataTypes.ENUM("contact", "agent", "bot"),
    allowNull: false,
  },
  senderName: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Message;
