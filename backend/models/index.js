const sequelize = require("../db");
const Agent = require("./Agent");
const Contact = require("./Contact");
const Inbox = require("./Inbox");
const Conversation = require("./Conversation");
const Message = require("./Message");

// Inbox -> Conversations
Inbox.hasMany(Conversation, { foreignKey: "inboxId", onDelete: "CASCADE" });
Conversation.belongsTo(Inbox, { foreignKey: "inboxId" });

// Contact -> Conversations
Contact.hasMany(Conversation, { foreignKey: "contactId", onDelete: "CASCADE" });
Conversation.belongsTo(Contact, { foreignKey: "contactId" });

// Agent (assigned) -> Conversations
Agent.hasMany(Conversation, { foreignKey: "assignedAgentId" });
Conversation.belongsTo(Agent, { foreignKey: "assignedAgentId", as: "assignedAgent" });

// Conversation -> Messages
Conversation.hasMany(Message, { foreignKey: "conversationId", onDelete: "CASCADE" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

module.exports = {
  sequelize,
  Agent,
  Contact,
  Inbox,
  Conversation,
  Message,
};
