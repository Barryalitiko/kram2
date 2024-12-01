const { PREFIX } = require("../../config");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { muteUserInGroup, unmuteUserInGroup } = require("../../utils/database"); // Asegúrate de tener estas funciones en el archivo de la base de datos

module.exports = {
  name: "mute",
  description: "Silencia a un usuario en el grupo durante un tiempo determinado.",
  commands: ["mute"],
  usage: `${PREFIX}mute @usuario [tiempo en minutos]`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid, userJid }) => {
    if (args.length < 2) {
      throw new InvalidParameterError(
        "👻 Krampus.bot 👻 Usa el comando de la siguiente forma: `${PREFIX}mute @usuario [tiempo en minutos]`."
      );
    }

    // Obtener el usuario mencionado
    const userToMute = args[0];
    const muteTime = parseInt(args[1]);

    // Verificar si el tiempo es válido
    if (isNaN(muteTime) || muteTime <= 0) {
      throw new InvalidParameterError(
        "👻 Krampus.bot 👻 El tiempo debe ser un número mayor a 0."
      );
    }

    // Lógica para silenciar al usuario
    await muteUserInGroup(remoteJid, userToMute, muteTime);

    await sendSuccessReact();
    await sendReply(`👻 El usuario @${userToMute} ha sido silenciado por ${muteTime} minutos.`);
  },
};
