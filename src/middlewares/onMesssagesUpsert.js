const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { handleAntiLongText } = require("../middlewares/antiLongText");
const { addDeletedMessage, isUserMuted } = require("../utils/database"); // Importamos isUserMuted

exports.onMessagesUpsert = async ({ socket, messages }) => {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    const commonFunctions = loadCommonFunctions({ socket, webMessage });

    if (!commonFunctions) {
      continue;
    }

    const groupId = webMessage.key.remoteJid;
    const userJid = webMessage.key.participant || webMessage.key.remoteJid;

    const muted = isUserMuted(groupId, userJid);
    if (muted) {
      await socket.sendMessage(groupId, {
        text: "👻 Estás silenciado en este grupo. No puedes enviar mensajes por ahora.",
      });
      continue; // No procesamos el comando si está silenciado
    }

    if (webMessage.message && webMessage.message.delete) {
      const userId = webMessage.key.participant || webMessage.key.remoteJid;
      const messageText = webMessage.message?.conversation || webMessage.message?.extendedTextMessage?.text;

      if (messageText) {
        addDeletedMessage(groupId, userId, messageText);
      }
    }

    await dynamicCommand(commonFunctions);
  }
};
