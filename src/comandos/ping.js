const formatoMoeda = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = {
    name: "ping",
    aliases: ["pong"],
    description: "Testa se o bot está respondendo e mostra estadísticas",
    category: "util",
    async execute(sock, msg) {
        const agora = new Date();
        const data = agora.toLocaleDateString("pt-PT");
        const hora = agora.toLocaleTimeString("pt-PT");

        const mem = process.memoryUsage();
        const uptimeSegundos = Math.floor(process.uptime());
        const uptimeFormatado = formatarUptime(uptimeSegundos);

        const texto = `🏓 *Pong!*\n\n` +
            `📅 *Data:* ${data}\n` +
            `🕒 *Hora:* ${hora}\n\n` +
            `📊 *Consumo de RAM:*\n` +
            `   Total (RSS):    ${formatoMoeda(mem.rss)}\n` +
            `   Heap Used:     ${formatoMoeda(mem.heapUsed)}\n` +
            `   Heap Total:    ${formatoMoeda(mem.heapTotal)}\n` +
            `   External:      ${formatoMoeda(mem.external)}\n` +
            `   Array Buffers: ${formatoMoeda(mem.arrayBuffers)}\n\n` +
            `⏱️  *Uptime:* ${uptimeFormatado}\n` +
            `🐘 *Node.js:* ${process.version}\n` +
            `💻 *Sistema:* ${process.platform} (${process.arch})\n`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};

function formatarUptime(segundos) {
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;

    if (dias > 0) return `${dias}d ${horas}h ${mins}m ${secs}s`;
    if (horas > 0) return `${horas}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}
