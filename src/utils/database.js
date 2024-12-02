const path = require("path");
const fs = require("fs");

const databasePath = path.resolve(__dirname, "..", "..", "database");

const INACTIVE_GROUPS_FILE = "inactive-groups";
const NOT_WELCOME_GROUPS_FILE = "not-welcome-groups";
const INACTIVE_AUTO_RESPONDER_GROUPS_FILE = "inactive-auto-responder-groups";
const ANTI_LINK_GROUPS_FILE = "anti-link-groups";
const DELETED_MESSAGES_FILE = "deleted-messages";
const MUTED_USERS_FILE = "muted-users";

function createIfNotExists(fullPath) {
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify([]));
  }
}

function readJSON(jsonFile) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
  createIfNotExists(fullPath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function writeJSON(jsonFile, data) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
  createIfNotExists(fullPath);
  fs.writeFileSync(fullPath, JSON.stringify(data));
}

exports.addDeletedMessage = (groupId, userId, messageText) => {
  const deletedMessages = readJSON(DELETED_MESSAGES_FILE);
  deletedMessages.push({ groupId, userId, messageText, timestamp: new Date().toISOString() });

  if (deletedMessages.length > 100) {
    deletedMessages.shift();
  }

  writeJSON(DELETED_MESSAGES_FILE, deletedMessages);
};

exports.getLastDeletedMessages = (groupId) => {
  const deletedMessages = readJSON(DELETED_MESSAGES_FILE);
  return deletedMessages
    .filter((message) => message.groupId === groupId)
    .slice(-6)
    .reverse();
};

exports.activateGroup = (groupId) => {
  const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
  const index = inactiveGroups.indexOf(groupId);

  if (index !== -1) {
    inactiveGroups.splice(index, 1);
    writeJSON(INACTIVE_GROUPS_FILE, inactiveGroups);
  }
};

exports.deactivateGroup = (groupId) => {
  const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
  if (!inactiveGroups.includes(groupId)) {
    inactiveGroups.push(groupId);
    writeJSON(INACTIVE_GROUPS_FILE, inactiveGroups);
  }
};

exports.isActiveGroup = (groupId) => {
  const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
  return !inactiveGroups.includes(groupId);
};

exports.activateWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  const index = notWelcomeGroups.indexOf(groupId);

  if (index !== -1) {
    notWelcomeGroups.splice(index, 1);
    writeJSON(NOT_WELCOME_GROUPS_FILE, notWelcomeGroups);
  }
};

exports.deactivateWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  if (!notWelcomeGroups.includes(groupId)) {
    notWelcomeGroups.push(groupId);
    writeJSON(NOT_WELCOME_GROUPS_FILE, notWelcomeGroups);
  }
};

exports.isActiveWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  return !notWelcomeGroups.includes(groupId);
};

exports.getAutoResponderResponse = (match) => {
  const responses = readJSON("auto-responder");
  const matchUpperCase = match.toLocaleUpperCase();
  const data = responses.find((response) => response.match.toLocaleUpperCase() === matchUpperCase);
  return data ? data.answer : null;
};

exports.activateAutoResponderGroup = (groupId) => {
  const inactiveAutoResponderGroups = readJSON(INACTIVE_AUTO_RESPONDER_GROUPS_FILE);
  const index = inactiveAutoResponderGroups.indexOf(groupId);

  if (index !== -1) {
    inactiveAutoResponderGroups.splice(index, 1);
    writeJSON(INACTIVE_AUTO_RESPONDER_GROUPS_FILE, inactiveAutoResponderGroups);
  }
};

exports.deactivateAutoResponderGroup = (groupId) => {
  const inactiveAutoResponderGroups = readJSON(INACTIVE_AUTO_RESPONDER_GROUPS_FILE);

  if (!inactiveAutoResponderGroups.includes(groupId)) {
    inactiveAutoResponderGroups.push(groupId);
    writeJSON(INACTIVE_AUTO_RESPONDER_GROUPS_FILE, inactiveAutoResponderGroups);
  }
};

exports.isActiveAutoResponderGroup = (groupId) => {
  const inactiveAutoResponderGroups = readJSON(INACTIVE_AUTO_RESPONDER_GROUPS_FILE);
  return !inactiveAutoResponderGroups.includes(groupId);
};

exports.activateAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  if (!antiLinkGroups.includes(groupId)) {
    antiLinkGroups.push(groupId);
    writeJSON(ANTI_LINK_GROUPS_FILE, antiLinkGroups);
  }
};

exports.deactivateAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  const index = antiLinkGroups.indexOf(groupId);

  if (index !== -1) {
    antiLinkGroups.splice(index, 1);
    writeJSON(ANTI_LINK_GROUPS_FILE, antiLinkGroups);
  }
};

exports.isActiveAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  return antiLinkGroups.includes(groupId);
};

module.exports = exports;
exports.activateAntiFloodGroup = (groupId) => {
  const antiFloodGroups = readJSON("anti-flood-groups");
  if (!antiFloodGroups.includes(groupId)) {
    antiFloodGroups.push(groupId);
    writeJSON("anti-flood-groups", antiFloodGroups);
  }
};

exports.deactivateAntiFloodGroup = (groupId) => {
  const antiFloodGroups = readJSON("anti-flood-groups");
  const index = antiFloodGroups.indexOf(groupId);

  if (index !== -1) {
    antiFloodGroups.splice(index, 1);
    writeJSON("anti-flood-groups", antiFloodGroups);
  }
};

exports.isActiveAntiFloodGroup = (groupId) => {
  const antiFloodGroups = readJSON("anti-flood-groups");
  return antiFloodGroups.includes(groupId);
};

exports.muteUser = (groupId, userJid, duration) => {
  if (typeof groupId !== "string" || !groupId.trim()) {
    throw new Error("Invalid groupId");
  }
  if (typeof userJid !== "string" || !userJid.trim()) {
    throw new Error("Invalid userJid");
  }
  if (typeof duration !== "number" || duration <= 0) {
    throw new Error("Duration must be a positive number");
  }

  const mutedUsers = readJSON(MUTED_USERS_FILE);

  if (Array.isArray(mutedUsers) || typeof mutedUsers !== "object") {
    console.warn(`Restructuring ${MUTED_USERS_FILE} to an object`);
    writeJSON(MUTED_USERS_FILE, {}); // Corregir estructura si está mal
    mutedUsers = {};
  }

  if (!mutedUsers[groupId]) {
    mutedUsers[groupId] = {};
  }

  mutedUsers[groupId][userJid] = Date.now() + duration;

  writeJSON(MUTED_USERS_FILE, mutedUsers);
};

exports.unmuteUser = (groupId, userJid) => {
  if (typeof groupId !== "string" || !groupId.trim()) {
    throw new Error("Invalid groupId");
  }
  if (typeof userJid !== "string" || !userJid.trim()) {
    throw new Error("Invalid userJid");
  }

  let mutedUsers = readJSON(MUTED_USERS_FILE);

  if (Array.isArray(mutedUsers) || typeof mutedUsers !== "object") {
    console.warn(`Restructuring ${MUTED_USERS_FILE} to an object`);
    writeJSON(MUTED_USERS_FILE, {}); // Corregir estructura si está mal
    mutedUsers = {};
  }


  if (mutedUsers[groupId] && typeof mutedUsers[groupId] === "object") {

    if (mutedUsers[groupId][userJid]) {
      delete mutedUsers[groupId][userJid]; // Eliminar al usuario silenciado
    }


    if (Object.keys(mutedUsers[groupId]).length === 0) {
      delete mutedUsers[groupId];
    }
  }


  writeJSON(MUTED_USERS_FILE, mutedUsers);
};

exports.isUserMuted = (groupId, userJid) => {
  // Validaciones básicas
  if (typeof groupId !== "string" || !groupId.trim()) {
    throw new Error("Invalid groupId");
  }
  if (typeof userJid !== "string" || !userJid.trim()) {
    throw new Error("Invalid userJid");
  }

  // Leer el archivo de usuarios silenciados
  const mutedUsers = readJSON(MUTED_USERS_FILE);

  // Asegurar que la estructura sea un objeto
  if (Array.isArray(mutedUsers) || typeof mutedUsers !== "object") {
    console.warn(`Restructuring ${MUTED_USERS_FILE} to an object`);
    return false; // Si el archivo no es válido, asumir que no hay usuarios silenciados
  }

  // Verificar que el grupo exista
  const groupMutedUsers = mutedUsers[groupId];
  if (!groupMutedUsers || typeof groupMutedUsers !== "object") {
    return false; // El grupo no tiene usuarios silenciados
  }

  // Verificar si el usuario está silenciado
  const muteEndTime = groupMutedUsers[userJid];
  if (typeof muteEndTime !== "number") {
    return false; // Si el tiempo no es válido, asumir que no está silenciado
  }

  // Verificar si el silencio ha expirado
  return muteEndTime > Date.now(); // Retorna true si sigue silenciado, false si no
};