const { getGroupMetadata, formatJid } = require("../utils/group");

module.exports = {
    name: "vota",
    aliases: ["poll", "votacao", "vote"],
    description: "Cria uma votação simples no grupo",
    category: "diversao",
    async execute(sock, msg, args) {
        if (args.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📊 *Como usar vota:*\n\n!vota "Pergunta" "Opção 1" "Opção 2" "Opção 3"\n\nExemplo:\n!vota "Qual o melhor filme?" "Matrix" "Interestelar" "Duna"`
            }, { quoted: msg });
            return;
        }

        const question = args[0];
        const options = args.slice(1);

        if (options.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Precisas de pelo menos 2 opções para votar."
            }, { quoted: msg });
            return;
        }

        if (options.length > 10) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Máximo de 10 opções por votação."
            }, { quoted: msg });
            return;
        }

        const text = `*📊 Votação*\n\n*${question}*\n\n`;
        const keyboard = options.map((opt, i) => ({
            body: opt
        }));

        const reply = {
            text,
            ...Object.fromEntries(keyboard.map((k, i) => [`button${i}`, k]))
        };

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            ...Object.fromEntries(keyboard.map((k, i) => [`button${i}`, k]))
        }, { quoted: msg });
    }
};
