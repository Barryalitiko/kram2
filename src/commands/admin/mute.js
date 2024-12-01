const { PREFIX } = require("../../config");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { muteUser, unmuteUser, isUserMuted } = require("../../utils/database");

module.exports = {
  name: "mute",
  description: "Silencia o desilencia a un usuario en el grupo.",
  commands: ["mute"],
  usage: `${PREFIX}mute @usuario (1/0)`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid, userJid, socket }) => {
    if (!args.length || !args[0].match(/^@(\d+|\w+)/)) {
      throw new InvalidParameterError("👻 Krampus.bot 👻 Menciona al usuario y usa 1 para silenciar o 0 para desilenciar.");
    }

    const mentionedUserJid = args[0];  // JID del usuario mencionado
    const action = args[1];  // 1 para silenciar, 0 para desilenciar

    if (action !== "1" && action !== "0") {
      throw new InvalidParameterError("👻 Krampus.bot 👻 Usa 1 para silenciar o 0 para desilenciar.");
    }

    const muteDuration = 1000 * 60 * 10;  // Silenciar por 10 minutos (en milisegundos)

    if (action === "1") {
      // Silenciar al usuario por 8 minutos
      muteUser(remoteJid, mentionedUserJid, muteDuration);
      await sendSuccessReact();
      await sendReply(`👻 Krampus.bot 👻 El usuario @${mentionedUserJid} ha sido silenciado por 8 minutos.`);
    } else if (action === "0") {
      // Desilenciar al usuario inmediatamente
      unmuteUser(remoteJid, mentionedUserJid);
      await sendSuccessReact();
      await sendReply(`👻 Krampus.bot 👻 El usuario @${mentionedUserJid} ha sido desilenciado.`);
    }
  },
};
