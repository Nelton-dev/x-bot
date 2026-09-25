module.exports = {
    name: "moeda",
    aliases: ["coin", "moedas"],
    description: "Lança uma moeda",
    category: "diversao",
    async execute(sock, msg) {
        const result = Math.random() < 0.5 ? "🟡 Cara" : "🔴 Coroa";
        const text = `*🪙 Moeda*\n\n` +
            `Resultado: ${result}\n\n` +
            `Jogada: ${new Date().toLocaleString("pt-PT")}`;

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};
