const { getGroupMetadata, isBotAdmin } = require("../utils/group");

module.exports = {
    name: "setdesc",
    aliases: ["descricao", "description", "desc", "mudar-desc"],
    description: "Altera a descrição do grupo (requer admin)",
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
                text: "❌ Preciso de permissões de admin para alterar a descrição."
            }, { quoted: msg });
            return;
        }

        const newDesc = args.join(" ");
        if (!newDesc || newDesc.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ A descrição deve ter pelo menos 2 caracteres.\n\nExemplo:\n!setdesc Este é o grupo da família"
            }, { quoted: msg });
            return;
        }

        if (newDesc.length > 1000) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ A descrição não pode ter mais de 1000 caracteres."
            }, { quoted: msg });
            return;
        }

        try {
            await sock.setDescription(msg.key.remoteJid, newDesc);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ Descrição alterada para: "${newDesc}"`
            }, { quoted: msg });
        } catch (e) {
            console.error("Erro ao alterar descrição:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui alterar a descrição. Pode não ter permissão."
            }, { quoted: msg });
        }
    }
};
