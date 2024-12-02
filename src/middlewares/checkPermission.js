const { OWNER_NUMBER } = require("../config");
const { isUserMuted } = require("../utils/database");

exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
  try {
    // 1. Validar el tipo solicitado
    if (!["member", "admin", "owner"].includes(type)) {
      throw new Error(`Tipo de permiso desconocido: ${type}`);
    }

    // 2. Los "members" siempre tienen permisos
    if (type === "member") {
      return true;
    }

    // 3. Obtener metadatos del grupo
    const metadata = await socket.groupMetadata(remoteJid);
    if (!metadata || !metadata.participants) {
      console.error("No se pudieron obtener los metadatos del grupo.");
      return false;
    }

    const { participants, owner } = metadata;

    // 4. Verificar la existencia del participante
    const participant = participants.find((p) => p.id === userJid);
    if (!participant) {
      console.error(`El usuario ${userJid} no está en el grupo.`);
      return false;
    }

    // 5. Determinar los roles del usuario
    const isOwner = participant.id === owner || participant.admin === "superadmin";
    const isAdmin = participant.admin === "admin";
    const isBotOwner = userJid === `${OWNER_NUMBER}@s.whatsapp.net`;

    // 6. Validar permisos según el tipo solicitado
    let hasPermission = false;

    if (type === "admin") {
      hasPermission = isOwner || isAdmin || isBotOwner;
    }

    if (type === "owner") {
      hasPermission = isOwner || isBotOwner;
    }

    // 7. Si el usuario no tiene permiso basado en roles, salir temprano
    if (!hasPermission) {
      return false;
    }

    // 8. Verificar si el usuario está silenciado
    const isMuted = await isUserMuted(remoteJid, userJid);
    if (isMuted) {
      console.log(`Usuario ${userJid} está silenciado en el grupo ${remoteJid}.`);
      return false;
    }

    // 9. Si pasó todas las verificaciones
    return true;
  } catch (error) {
    console.error("Error en checkPermission:", error.message);
    return false;
  }
};
