module.exports = {
    name: "dado",
    aliases: ["roll", "dice", "jogar"],
    description: "Rola um dado com N faces",
    category: "diversao",
    async execute(sock, msg, args) {
        const faces = parseInt(args[0]) || 6;
        if (faces < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ O dado precisa ter pelo menos 2 faces."
            }, { quoted: msg });
            return;
        }
        if (faces > 1000) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Máximo de 1000 faces."
            }, { quoted: msg });
            return;
        }

        const result = Math.floor(Math.random() * faces) + 1;
        const text = `*🎲 Dado*\n\n` +
            `Faces: ${faces}\n` +
            `Resultado: ${result}\n\n` +
            `Jogada: ${new Date().toLocaleString("pt-PT")}`;

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};
