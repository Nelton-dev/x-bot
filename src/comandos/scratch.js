const { getGroupMetadata, getParticipants, formatJid } = require("../utils/group");

module.exports = {
    name: "scratch",
    aliases: ["sorteio", "sortear"],
    description: "Sorteia um membro aleatório do grupo",
    category: "diversao",
    async execute(sock, msg, args) {
        const metadata = await getGroupMetadata(sock, msg.key.remoteJid);
        if (!metadata) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui obter participantes do grupo."
            }, { quoted: msg });
            return;
        }

        const participants = getParticipants(metadata);
        if (participants.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ O grupo precisa ter pelo menos 2 participantes para sortear."
            }, { quoted: msg });
            return;
        }

        const excludeBot = args.includes("-bot") || args.includes("--incluir-bot");
        let pool = participants;
        if (!excludeBot) {
            pool = participants.filter(p => p !== sock.user.id);
        }
        if (pool.length < 1) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Não há participantes válidos para sortear (excluiu-se o bot)."
            }, { quoted: msg });
            return;
        }

        const winner = pool[Math.floor(Math.random() * pool.length)];
        const winnerName = formatJid(winner);
        const mentioned = participants.filter(p => p !== sock.user.id).map(p => ({ tag: formatJid(p), id: p }));

        const text = `*🎲 Sorteio*\n\n` +
            `🎉 *Vencedor:* @${winnerName}\n\n` +
            `Participantes: ${participants.length - 1}${excludeBot ? "+" : ""}\n` +
            `Excluiu bot: ${!excludeBot ? "Sim" : "Não"}`;

        const mentions = excludeBot
            ? participants.filter(p => p !== sock.user.id)
            : participants;

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: mentions.map(m => ({ tag: formatJid(m), id: m }))
        }, { quoted: msg });
    }
};
