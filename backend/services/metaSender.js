const axios = require("axios");

/**
 * Sends a text reply back out to the customer on the originating Meta channel.
 * Only fires when the inbox is a facebook/instagram/whatsapp channel with
 * credentials saved in inbox.settings (set via Settings > Channels in the UI).
 */
async function sendToMeta(inbox, contact, text) {
  if (!inbox || !contact?.externalId) return;

  const settings = inbox.settings || {};

  if (inbox.channelType === "facebook" || inbox.channelType === "instagram") {
    const pageAccessToken = settings.pageAccessToken;
    if (!pageAccessToken) return;
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
      {
        recipient: { id: contact.externalId },
        message: { text },
      }
    );
    return;
  }

  if (inbox.channelType === "whatsapp") {
    const { whatsappPhoneNumberId, whatsappAccessToken } = settings;
    if (!whatsappPhoneNumberId || !whatsappAccessToken) return;
    await axios.post(
      `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: contact.externalId,
        type: "text",
        text: { body: text },
      },
      {
        headers: { Authorization: `Bearer ${whatsappAccessToken}` },
      }
    );
    return;
  }
}

module.exports = { sendToMeta };
