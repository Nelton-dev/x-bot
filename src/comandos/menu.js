module.exports = {
    name: "menu",
    aliases: ["help", "comandos"],
    description: "Menu interactivo: mostra categorias ou filtra por categoria",
    async execute(sock, msg, args) {
        const fs = require("fs");
        const path = require("path");
        const comandosDir = path.join(__dirname, "..", "comandos");

        // Ler todos os comandos e categorizar
        const comandoMap = new Map();
        for (const f of fs.readdirSync(comandosDir).filter(f => f.endsWith(".js") && f !== "menu.js")) {
            try {
                const cmd = require(path.join(comandosDir, f));
                if (cmd && cmd.name) {
                    comandoMap.set(cmd.name.toLowerCase(), {
                        name: cmd.name,
                        description: cmd.description || "Sem descrição",
                        category: cmd.category || "outros",
                        aliases: cmd.aliases || []
                    });
                }
            } catch (e) {
                console.error(`Erro ao ler comando ${f}:`, e.message);
            }
        }

        if (comandoMap.size === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "🤖 *X-BOT*\n\nNão há comandos disponíveis."
            }, { quoted: msg });
            return;
        }

        // Se foi fornecida uma categoria, filtrar por ela
        if (args.length > 0) {
            const catInput = args[0].toLowerCase();
            const categorias = {
                info: "Informação",
                util: "Utilitários",
                diversao: "Diversão",
                admin: "Administração",
                outros: "Outros"
            };

            const catLabel = categorias[catInput];
            if (!catLabel) {
                // Tentar fazer fuzzy match
                const found = Object.entries(categorias).find(([k, v]) =>
                    k.includes(catInput) || v.toLowerCase().includes(catInput)
                );
                if (found) {
                    const catKey = found[0];
                    const cmds = [...comandoMap.values()]
                        .filter(c => c.category === catKey)
                        .sort((a, b) => a.name.localeCompare(b.name));

                    if (cmds.length === 0) {
                        await sock.sendMessage(msg.key.remoteJid, {
                            text: `🤖 *X-BOT — Menu*\n\n` +
                                `📂 *${found[1]}*\n` +
                                `Nenhum comando nesta categoria.`
                        }, { quoted: msg });
                        return;
                    }

                    await sock.sendMessage(msg.key.remoteJid, {
                        text: buildCategoryMessage(catKey, found[1], cmds)
                    }, { quoted: msg });
                    return;
                }

                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🤖 *X-BOT — Menu*\n\n` +
                        `❌ Categoria "${args[0]}" não encontrada.\n\n` +
                        ` Categorias disponíveis:\n` +
                        Object.entries(categorias).map(([k, v]) => `   \`!menu ${k}\` — ${v}`).join("\n")
                }, { quoted: msg });
                return;
            }

            const cmds = [...comandoMap.values()]
                .filter(c => c.category === catInput)
                .sort((a, b) => a.name.localeCompare(b.name));

            if (cmds.length === 0) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🤖 *X-BOT — Menu*\n\n` +
                        `📂 *${catLabel}*\n` +
                        `Nenhum comando nesta categoria.`
                }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: buildCategoryMessage(catInput, catLabel, cmds)
            }, { quoted: msg });
            return;
        }

        // Nenhuma categoria: mostrar lista de categorias
        const categorias = {
            info: "Informação",
            util: "Utilitários",
            diversao: "Diversão",
            admin: "Administração",
            outros: "Outros"
        };

        // Contagem por categoria
        const counts = {};
        for (const cmd of comandoMap.values()) {
            counts[cmd.category] = (counts[cmd.category] || 0) + 1;
        }

        let text = `🤖 *X-BOT — Menu*\n\n`;
        text += `📂 *Escolhe uma categoria:*\n\n`;

        for (const [key, label] of Object.entries(categorias)) {
            const count = counts[key] || 0;
            text += `🔹 *!menu ${key}* — ${label} (${count})\n`;
        }

        text += `\n💡 *Exemplo:* !menu info\n`;
        text += `   ou !menu admin\n`;

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};

function buildCategoryMessage(catKey, catLabel, cmds) {
    const separator = "─".repeat(28);
    const half = "─".repeat(14);

    let text = `🤖 *X-BOT — Menu*\n\n`;
    text += `📂 *${catLabel}*\n`;
    text += `${half}┄${half}\n\n`;

    for (const cmd of cmds) {
        const aliases = cmd.aliases.length
            ? ` *alias:* \`${cmd.aliases.join(", ")}\``
            : "";
        text += `⚡ *!${cmd.name}*${aliases}\n`;
        text += `   ${cmd.description}\n\n`;
    }

    text += `${separator}\n`;
    text += `*🔙 *Voltar ao menu:* !menu\n`;
    text += `\n*💡 Como usar:*\n`;
    text += `   !comando [args]\n`;

    return text;
}
