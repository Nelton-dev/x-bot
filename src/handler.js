/*Vê,não mexe em nada*/

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

// Configuração via variável de ambiente
const PREFIX = process.env.BOT_PREFIX || "!";
const COOLDOWN_MS = parseInt(process.env.BOT_COOLDOWN_MS, 10) || 3000;

// Rate limiting: evita spam de repetição de media
const rateLimit = new Map(); // JID -> timestamp (ms)

// Estatísticas de uso
const stats = {
    commandsExecuted: 0,
    messagesReceived: 0
};

module.exports = async (sock, msg) => {
    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

    logger.logActivity("message", {
        from: msg.sender,
        to: msg.key.remoteJid,
        text: text.substring(0, 200)
    });

    stats.messagesReceived++;

    // Emoji ou "." como gatilho discreto — repeat do media citado
    if (/^[\p{Emoji}\p{Emoji_Modifier}\uFE0F]+$|^\.$/u.test(text.trim())) {
        const MY_JID = sock.user.id.replace(/:\d+/, "");
        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.quotedMessage) return;
        const quoted = ctx.quotedMessage;

        // Rate limiting: cooldown de 3 segundos por JID
        const now = Date.now();
        const last = rateLimit.get(MY_JID);
        if (last && now - last < COOLDOWN_MS) {
            return;
        }
        rateLimit.set(MY_JID, now);

        // Evitar loop: se o media citado é do próprio bot, ignora
        const quotedSender = quoted.sender || "";
        if (quotedSender === sock.user.id) {
            return;
        }

        let actual = null;
        let type = null;

        // viewOnce messages (qualquer tipo de media dentro)
        if (quoted.viewOnceMessageV2?.message) {
            actual = quoted.viewOnceMessageV2.message;
            type = Object.keys(actual)[0];
        } else if (quoted.viewOnceMessage?.message) {
            actual = quoted.viewOnceMessage.message;
            type = Object.keys(actual)[0];
        }
        // media normais com flag viewOnce
        if (!actual && quoted.imageMessage?.viewOnce) {
            actual = { imageMessage: quoted.imageMessage };
            type = "imageMessage";
        }
        if (!actual && quoted.videoMessage?.viewOnce) {
            actual = { videoMessage: quoted.videoMessage };
            type = "videoMessage";
        }
        // media normais (não viewOnce)
        if (!actual && quoted.videoMessage) {
            actual = { videoMessage: quoted.videoMessage };
            type = "videoMessage";
        }
        if (!actual && quoted.imageMessage) {
            actual = { imageMessage: quoted.imageMessage };
            type = "imageMessage";
        }
        if (!actual && quoted.audioMessage) {
            actual = { audioMessage: quoted.audioMessage };
            type = "audioMessage";
        }
        if (!actual && quoted.voiceMessage) {
            actual = { voiceMessage: quoted.voiceMessage };
            type = "voiceMessage";
        }

        if (!actual || !type) return;

        try {
            const media = actual[type];
            let downloadType = type.replace("Message", "");
            if (downloadType === "voice") downloadType = "audio";

            const stream = await downloadContentFromMessage(media, downloadType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (type === "imageMessage") {
                await sock.sendMessage(MY_JID, { image: buffer });
            } else if (type === "videoMessage") {
                await sock.sendMessage(MY_JID, { video: buffer });
            } else if (type === "audioMessage") {
                await sock.sendMessage(MY_JID, { audio: buffer, mimetype: "audio/mp4" });
            } else if (type === "voiceMessage") {
                await sock.sendMessage(MY_JID, { audio: buffer, mimetype: "audio/ogg" });
            }
        } catch (e) {
            console.error("Erro ao processar media:", e);
            await sock.sendMessage(MY_JID, {
                text: "⚠️ Não consegui descarregar o media citado. Pode ser que o link tenha expirado (apenas é válido por alguns minutos) ou houve um erro de rede. Tenta citar e reagir mais rápido."
            });
        }
        return;
    }

    // Comandos com prefixo configurable
    if (!text.startsWith(PREFIX)) return;
    stats.messagesReceived++;
    const args = text.slice(PREFIX.length).trim().split(/ +/);
    const comando = args.shift().toLowerCase();
    const arquivo = path.join(__dirname, "comandos", `${comando}.js`);
    if (!fs.existsSync(arquivo)) return;

    let cmd;
    try {
        cmd = require(arquivo);
    } catch (e) {
        console.error(`Erro ao carregar comando "${comando}":`, e.message);
        return;
    }
    if (typeof cmd.execute !== "function") {
        console.error(`Comando "${comando}" não tem execute válido`);
        return;
    }

    stats.commandsExecuted++;
    try {
        await cmd.execute(sock, msg, args);
        logger.logActivity("command", {
            from: msg.sender,
            command: comando,
            args: args,
            to: msg.key.remoteJid
        });
    } catch (e) {
        console.error(`Erro ao executar comando "${comando}":`, e);
    }
};

// Exportar stats para outros módulos (ex: !status)
module.exports.stats = stats;
