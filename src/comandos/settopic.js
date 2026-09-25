const { getGroupMetadata, isBotAdmin } = require("../utils/group");

module.exports = {
    name: "settopic",
    aliases: ["tópico", "topic", "topico", "assunto", "mudar-topic"],
    description: "Altera o tópico do grupo (requer admin)",
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
                text: "❌ Preciso de permissões de admin para alterar o tópico."
            }, { quoted: msg });
            return;
        }

        const newTopic = args.join(" ");
        if (!newTopic || newTopic.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ O tópico deve ter pelo menos 2 caracteres.\n\nExemplo:\n!settopic Título do grupo"
            }, { quoted: msg });
            return;
        }

        if (newTopic.length > 100) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ O tópico não pode ter mais de 100 caracteres."
            }, { quoted: msg });
            return;
        }

        try {
            await sock.setTopic(msg.key.remoteJid, newTopic);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ Tópico alterado para: "${newTopic}"`
            }, { quoted: msg });
        } catch (e) {
            console.error("Erro ao alterar tópico:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Não consegui alterar o tópico. Pode não ter permissão."
            }, { quoted: msg });
        }
    }
};
