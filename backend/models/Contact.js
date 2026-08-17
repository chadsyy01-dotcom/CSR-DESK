const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Contact = sequelize.define("Contact", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: "Guest" },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  // External id from the source channel (e.g. Facebook PSID, WhatsApp wa_id)
  externalId: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Contact;
