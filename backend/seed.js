require("dotenv").config();
const { sequelize, Agent, Inbox, Contact, Conversation, Message } = require("./models");

async function seed() {
  await sequelize.sync({ force: false });

  const [admin] = await Agent.findOrCreate({
    where: { email: "admin@example.com" },
    defaults: {
      name: "Admin Agent",
      role: "administrator",
      passwordHash: Agent.hashPassword("admin123"),
    },
  });

  const [websiteInbox] = await Inbox.findOrCreate({
    where: { name: "Website Chat" },
    defaults: { channelType: "website" },
  });

  const [fbInbox] = await Inbox.findOrCreate({
    where: { name: "Facebook Page" },
    defaults: { channelType: "facebook" },
  });

  const [contact] = await Contact.findOrCreate({
    where: { email: "juan@example.com" },
    defaults: { name: "Juan Dela Cruz" },
  });

  const [conversation] = await Conversation.findOrCreate({
    where: { inboxId: websiteInbox.id, contactId: contact.id },
    defaults: { status: "open" },
  });

  const existingMessages = await Message.count({ where: { conversationId: conversation.id } });
  if (existingMessages === 0) {
    await Message.create({
      conversationId: conversation.id,
      content: "Hi, may tanong ako sa order ko.",
      senderType: "contact",
      senderName: contact.name,
    });
    conversation.lastMessagePreview = "Hi, may tanong ako sa order ko.";
    conversation.lastMessageAt = new Date();
    await conversation.save();
  }

  console.log("Seed complete:");
  console.log("- Login with: admin@example.com / admin123");
  console.log("- Inboxes:", websiteInbox.name, "/", fbInbox.name);
  console.log("- Sample conversation with contact:", contact.name);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
