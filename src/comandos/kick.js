const { getGroupMetadata, isBotAdmin, formatJid } = require("../utils/group");

module.exports = {
    name: "kick",
    aliases: ["expulsar", "remove", "remover"],
    description: "Remove um membro do grupo (requer admin)",
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
                text: "❌ Preciso de permissões de admin para remover membros."
            }, { quoted: msg });
            return;
        }

        if (args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `👥 *Como usar kick:*\n\n!kick @membro [motivo]\n\nExemplo:\n!kick @joao Não está a participar\n\nOu:\n!kick 123456789 Motivo opcional`
            }, { quoted: msg });
            return;
        }

        // Tenta extrair o JID do argumento (pode ser @num ou número puro)
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
                text: "❌ Não consegui identificar o membro a remover. Usa !kick @membro ou !kick numero"
            }, { quoted: msg });
            return;
        }

        const targetName = formatJid(targetJid);
        const motivo = args.slice(1).join(" ") || "Sem motivo indicado";

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `👋 @${targetName} foi removido${motivo ? ` — ${motivo}` : ""}`
            }, { quoted: msg });

            await sock.removeParticipant(msg.key.remoteJid, targetJid);
        } catch (e) {
            console.error("Erro ao remover participante:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Não consegui remover @${targetName}. Pode não ser possível remover esse membro.`
            }, { quoted: msg });
        }
    }
};
