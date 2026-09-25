const { getGroupMetadata, getParticipants, formatJid } = require("../utils/group");

module.exports = {
    name: "destino",
    aliases: ["equipas", "teams"],
    description: "Divide o grupo em equipas aleatórias",
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
        const total = participants.length - 1; // exclui bot
        const pool = participants.filter(p => p !== sock.user.id);

        if (pool.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ O grupo precisa ter pelo menos 2 participantes (excluindo o bot)."
            }, { quoted: msg });
            return;
        }

        // Número de equipas (default 2)
        let numTeams = parseInt(args[0]) || 2;
        if (numTeams < 2) numTeams = 2;
        if (numTeams > pool.length) numTeams = pool.length;

        // Embaralha os participantes
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Distribui pelas equipas
        const teams = [];
        const membersPerTeam = Math.ceil(pool.length / numTeams);
        for (let t = 0; t < numTeams; t++) {
            const start = t * membersPerTeam;
            const end = Math.min(start + membersPerTeam, pool.length);
            teams.push(shuffled.slice(start, end));
        }

        const teamNames = ["🔴 Team A", "🔵 Team B", "🟢 Team C", "🟡 Team D", "🟣 Team E", "🟠 Team F", "⚪ Team G", "🟤 Team H"];
        const text = `*🏆 Equipas*\n\n`;
        let replyText = `*🏆 Equipas*\n\n`;
        for (let t = 0; t < teams.length; t++) {
            const membersList = teams[t].map(p => `@${formatJid(p)}`).join(", ");
            text += `${teamNames[t] || `Team ${String.fromCharCode(65 + t)}`}: ${membersList}\n`;
            replyText += `${teamNames[t] || `Team ${String.fromCharCode(65 + t)}`}: ${membersList}\n`;
        }
        text += `\n🧑‍🤝‍🧑 Total: ${pool.length} participantes\n`;
        text += `📊 Equipas: ${numTeams}`;
        replyText += `\n🧑‍🤝‍🧑 Total: ${pool.length} participantes\n`;
        replyText += `📊 Equipas: ${numTeams}`;

        await sock.sendMessage(msg.key.remoteJid, { text: replyText }, { quoted: msg });
    }
};
