const { OWNER_NUMBER } = require("../config");
const { isUserMuted } = require("../utils/database"); // Importamos la función isUserMuted

exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
  if (type === "member") {
    return true;
  }

  try {
    // Verificamos si el usuario está silenciado
    const isMuted = await isUserMuted(remoteJid, userJid); // Verificación de silenciado
    if (isMuted) {
      return false; // Si el usuario está silenciado, no tiene permisos
    }

    const { participants, owner } = await socket.groupMetadata(remoteJid);

    const participant = participants.find(
      (participant) => participant.id === userJid
    );

    if (!participant) {
      return false;
    }

    const isOwner =
      participant.id === owner || participant.admin === "superadmin";

    const isAdmin = participant.admin === "admin";

    const isBotOwner = userJid === `${OWNER_NUMBER}@s.whatsapp.net`;

    if (type === "admin") {
      return isOwner || isAdmin || isBotOwner;
    }

    if (type === "owner") {
      return isOwner || isBotOwner;
    }

    return false;
  } catch (error) {
    return false;
  }
};
