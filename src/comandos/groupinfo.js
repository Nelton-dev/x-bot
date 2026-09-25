const { getGroupMetadata, isBotAdmin, formatJid, formatMemberCount } = require("../utils/group");

module.exports = {
    name: "groupinfo",
    aliases: ["infogroup", "info"],
    description: "Mostra informações do grupo atual",
    category: "info",
    async execute(sock, msg) {
        const metadata = await getGroupMetadata(sock, msg.key.remoteJid);
        if (!metadata) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui obter informações do grupo."
            }, { quoted: msg });
            return;
        }

        const isAdmin = isBotAdmin(metadata, sock);
        const memberCount = metadata.participants?.length || 0;

        const text = `*📊 Informações do Grupo*\n\n` +
            `🏷️ *Nome:* ${metadata.subject || "—"}\n` +
            `📝 *Descrição:* ${metadata.description || "—"}\n` +
            `📌 *Tópico:* ${metadata.topic || metadata.subject || "—"}\n` +
            `👥 *Membros:* ${formatMemberCount(memberCount)}\n` +
            `🔑 *ID:* ${metadata.id || "—"}\n` +
            `🤖 *Bot é admin:* ${isAdmin ? "✅ Sim" : "❌ Não"}\n` +
            `👤 *Dono:* ${formatJid(metadata.creator || metadata.owner)}`;

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};
