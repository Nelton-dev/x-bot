const { getGroupMetadata, isBotAdmin, formatJid } = require("../utils/group");

module.exports = {
    name: "ban",
    aliases: ["baneirar", "banir"],
    description: "Banca um membro do grupo (requer admin)",
    category: "admin",
    async execute(sock, msg, args) {
        const metadata = await getGroupMetadata(sock, msg.key.remoteJid);
        if (!metadata) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui obter informações do grupo."
            }, { quoted: msg });
            return;
        }

        if (!isBotAdmin(metadata, sock)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Preciso de permissões de admin para baniros."
            }, { quoted: msg });
            return;
        }

        if (args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🚫 *Como usar ban:*\n\n!ban @membro [motivo]\n\nExemplo:\n!ban @joao Spam no grupo\n\nOu:\n!ban 123456789 Motivo opcional`
            }, { quoted: msg });
            return;
        }

        // Tenta extrair o JID
        let targetJid = null;
        for (const arg of args) {
            const cleanArg = arg.replace(/[@\s]/g, "");
            if (cleanArg.match(/^\d+$/) && cleanArg.length >= 9) {
                targetJid = `${cleanArg}@${msg.key.remoteJid.split("@")[1]}`;
                break;
            }
        }

        if (!targetJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui identificar o membro a banir."
            }, { quoted: msg });
            return;
        }

        const targetName = formatJid(targetJid);
        const motivo = args.slice(1).join(" ") || "Sem motivo indicado";

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🚫 @${targetName} foi banido${motivo ? ` — ${motivo}` : ""}`
            }, { quoted: msg });

            // O Baileys não tem função explícita de ban, mas remover o participante afectivamente o bana
            await sock.removeParticipant(msg.key.remoteJid, targetJid);
        } catch (e) {
            console.error("Erro ao banir participante:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Não consegui banir @${targetName}.`
            }, { quoted: msg });
        }
    }
};
