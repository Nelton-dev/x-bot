const { getGroupMetadata, getAdmins, formatJid } = require("../utils/group");

module.exports = {
    name: "admins",
    aliases: ["admin", "admins"],
    description: "Lista os administradores do grupo",
    category: "info",
    async execute(sock, msg) {
        const metadata = await getGroupMetadata(sock, msg.key.remoteJid);
        if (!metadata) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui obter informações do grupo."
            }, { quoted: msg });
            return;
        }

        const admins = getAdmins(metadata);
        if (admins.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Ninguém é administrador neste grupo."
            }, { quoted: msg });
            return;
        }

        const text = `*👑 Administradores*\n\n`;
        admins.forEach((adminJid, i) => {
            text += `${i + 1}. @${formatJid(adminJid)}\n`;
        });
        text += `\n👤 Total: ${admins.length} admin${admins.length !== 1 ? "s" : ""}`;

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};
