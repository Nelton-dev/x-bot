const { getGroupMetadata, getParticipants, formatJid, formatMemberCount } = require("../utils/group");

module.exports = {
    name: "members",
    aliases: ["membros", "member"],
    description: "Mostra o número de membros do grupo",
    category: "info",
    async execute(sock, msg, args) {
        const metadata = await getGroupMetadata(sock, msg.key.remoteJid);
        if (!metadata) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui obter informações do grupo."
            }, { quoted: msg });
            return;
        }

        const participants = getParticipants(metadata);
        const count = participants.length;
        const showList = args.includes("-l") || args.includes("--lista");

        if (showList) {
            if (count > 50) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `⚠️ O grupo tem ${formatMemberCount(count)} membros. A lista só está disponível para grupos com menos de 50 membros.`
                }, { quoted: msg });
                return;
            }

            const text = `*👥 Lista de membros*\n\n`;
            const list = participants.map((pj, i) => `${i + 1}. @${formatJid(pj)}`).join("\n");
            await sock.sendMessage(msg.key.remoteJid, { text: text + list }, { quoted: msg });
        } else {
            const text = `*👥 Membros*\n\n` +
                `Total: ${formatMemberCount(count)}\n\n` +
                `Usa ! -l para ver a lista completa.`;

            await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
        }
    }
};
