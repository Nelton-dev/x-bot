/**
 * Utilidades para operações com grupos
 */

/**
 * Obtém metadata do grupo
 * @param {import("@whiskeysockets/baileys").WASocket} sock
 * @param {string} groupJid
 * @returns {Promise<object|null>}
 */
async function getGroupMetadata(sock, groupJid) {
    try {
        return await sock.groupMetadata(groupJid);
    } catch (e) {
        console.error(`Erro ao obter metadata do grupo ${groupJid}:`, e.message);
        return null;
    }
}

/**
 * Verifica se o bot é admin do grupo
 * @param {object} metadata - metadata do grupo
 * @param {import("@whiskeysockets/baileys").WASocket} sock
 * @returns {boolean}
 */
function isBotAdmin(metadata, sock) {
    if (!metadata || !metadata.participants) return false;
    const botParticipant = metadata.participants.find(p => p === sock.user.id);
    return botParticipant ? botParticipant.admin : false;
}

/**
 * Verifica se uma pessoa é admin do grupo
 * @param {object} metadata - metadata do grupo
 * @param {string} jid - JID da pessoa
 * @returns {boolean}
 */
function isParticipantAdmin(metadata, jid) {
    if (!metadata || !metadata.participants) return false;
    const participant = metadata.participants.find(p => p === jid);
    return participant ? participant.admin : false;
}

/**
 * Obtém lista de participantes (JIDs) do grupo
 * @param {object} metadata - metadata do grupo
 * @returns {string[]}
 */
function getParticipants(metadata) {
    if (!metadata || !metadata.participants) return [];
    return metadata.participants.map(p => p);
}

/**
 * Obtém lista de admins (JIDs) do grupo
 * @param {object} metadata - metadata do grupo
 * @returns {string[]}
 */
function getAdmins(metadata) {
    if (!metadata || !metadata.participants) return [];
    return metadata.participants
        .filter(p => p.admin)
        .map(p => p);
}

/**
 * Formata JID para nome legível (número sem @domain)
 * @param {string} jid
 * @returns {string}
 */
function formatJid(jid) {
    if (!jid) return "—";
    return jid.split("@")[0].replace(/[-:]/g, "");
}

/**
 * Formata número de participantes em texto legível
 * @param {number} count
 * @returns {string}
 */
function formatMemberCount(count) {
    if (count < 1000) return `${count} membro${count !== 1 ? "s" : ""}`;
    return `${(count / 1000).toFixed(1)}K membros`;
}

module.exports = {
    getGroupMetadata,
    isBotAdmin,
    isParticipantAdmin,
    getParticipants,
    getAdmins,
    formatJid,
    formatMemberCount
};
