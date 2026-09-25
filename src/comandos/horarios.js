module.exports = {
    name: "horarios",
    aliases: ["timezones", "horario", "tempo", "time"],
    description: "Mostra a hora atual em vários fusos horários",
    category: "diversao",
    async execute(sock, msg, args) {
        const timezones = [
            { name: "Porto / Lisboa", tz: "Europe/Lisbon", emoji: "🇵🇹" },
            { name: "Londres", tz: "Europe/London", emoji: "🇬🇧" },
            { name: "Paris", tz: "Europe/Paris", emoji: "🇫🇷" },
            { name: "Berlim", tz: "Europe/Berlin", emoji: "🇩🇪" },
            { name: "Moscovo", tz: "Europe/Moscow", emoji: "🇷🇺" },
            { name: "Nova Iorque", tz: "America/New_York", emoji: "🇺🇸" },
            { name: "Chicago", tz: "America/Chicago", emoji: "🇺🇸" },
            { name: "Los Angeles", tz: "America/Los_Angeles", emoji: "🇺🇸" },
            { name: "São Paulo", tz: "America/Sao_Paulo", emoji: "🇧🇷" },
            { name: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", emoji: "🇦🇷" },
            { name: "Tokio", tz: "Asia/Tokyo", emoji: "🇯🇵" },
            { name: "Seul", tz: "Asia/Seoul", emoji: "🇰🇷" },
            { name: "Singapura", tz: "Asia/Singapore", emoji: "🇸🇬" },
            { name: "Dubai", tz: "Asia/Dubai", emoji: "🇦🇪" },
            { name: "Sydney", tz: "Australia/Sydney", emoji: "🇦🇺" }
        ];

        const now = new Date();
        const text = `*🕐 Horários*\n\n`;
        const lines = timezones.map(tz => {
            try {
                const formatter = new Intl.DateTimeFormat("pt-PT", {
                    timeZone: tz.tz,
                    hour: "2-digit",
                    minute: "2-digit"
                });
                const time = formatter.format(now);
                return `${tz.emoji} ${tz.name}: ${time}`;
            } catch {
                return `${tz.emoji} ${tz.name}: ❌`;
            }
        });

        const reply = text + lines.join("\n") + `\n\n🕒 ${now.toLocaleString("pt-PT")}`;

        await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
    }
};
