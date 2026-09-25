const handler = require("../handler");
const { name, version } = require("../../package.json");
const os = require("os");

module.exports = {
    name: "status",
    aliases: ["estado", "info", "botinfo"],
    description: "Mostra o estado atual do bot",
    category: "util",
    async execute(sock, msg) {
        const uptimeSeconds = Math.floor(process.uptime());
        const uptimeFormatted = formatUptime(uptimeSeconds);

        const localIP = getLocalIP();
        const stats = handler.stats;

        const line = "─".repeat(30);
        const text = `*🤖 X-BOT — Estado*\n\n${line}\n` +
            `📡 *Estado:* ${sock.user?.id ? "🟢 Ligado" : "🔴 Desligado"}\n` +
            `👤 *Utilizador:* ${sock.user?.id || "—"}\n` +
            `📦 *Versão:* ${version}\n` +
            `⏱️  *Uptime:* ${uptimeFormatted}\n` +
            `💻 *Plataforma:* ${process.platform} ${process.arch}\n` +
            `🐘 *Node.js:* ${process.version}\n` +
            `🌐 *IP Local:* ${localIP || "—"}\n` +
            `${line}\n` +
            `*Sessão:* ./sessions/\n` +
            `*Prefixo:* ${process.env.BOT_PREFIX || "!"} (comandos) | emoji/. (repetir media)\n` +
            `*Cooldown:* ${process.env.BOT_COOLDOWN_MS || 3000}ms\n` +
            `${line}\n` +
            `*📊 Estatísticas:*\n` +
            `   Comandos executados: ${stats.commandsExecuted}\n` +
            `   Mensagens recebidas: ${stats.messagesReceived}\n`;

        await sock.sendMessage(
            msg.key.remoteJid,
            { text },
            { quoted: msg }
        );
    }
};

function formatUptime(seconds) {
    const dias = Math.floor(seconds / 86400);
    const horas = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (dias > 0) return `${dias}d ${horas}h ${mins}m`;
    if (horas > 0) return `${horas}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}
