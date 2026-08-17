const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../db");

const Agent = sequelize.define(
  "Agent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("administrator", "agent"),
      defaultValue: "agent",
    },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    avatarColor: { type: DataTypes.STRING, defaultValue: "#2F6F5E" },
  },
  {
    defaultScope: {
      attributes: { exclude: ["passwordHash"] },
    },
    scopes: {
      withPassword: { attributes: { include: ["passwordHash"] } },
    },
  }
);

Agent.prototype.checkPassword = function (plain) {
  return bcrypt.compareSync(plain, this.passwordHash);
};

Agent.hashPassword = function (plain) {
  return bcrypt.hashSync(plain, 10);
};

module.exports = Agent;
