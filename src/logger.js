const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "..", "activity.log");

/**
 * Regista uma atividade no log
 * @param {string} type - tipo de atividade (message, command, error, etc.)
 * @param {object} data - dados da atividade
 */
function logActivity(type, data) {
    const entry = {
        type,
        timestamp: new Date().toISOString(),
        ...data
    };

    const line = JSON.stringify(entry) + "\n";

    try {
        fs.appendFileSync(LOG_FILE, line, "utf-8");
    } catch (e) {
        console.error("Erro ao escrever log:", e.message);
    }
}

/**
 * Lê as últimas N entradas do log
 * @param {number} limit - número máximo de entradas
 * @returns {Array} lista de entradas
 */
function readLogs(limit = 100) {
    try {
        if (!fs.existsSync(LOG_FILE)) return [];

        const content = fs.readFileSync(LOG_FILE, "utf-8");
        const lines = content.trim().split("\n").filter(line => line.trim());

        const entries = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(e => e !== null);

        return entries.slice(-limit);
    } catch {
        return [];
    }
}

/**
 * Limpa o ficheiro de logs
 */
function clearLogs() {
    try {
        fs.writeFileSync(LOG_FILE, "", "utf-8");
    } catch (e) {
        console.error("Erro ao limpar logs:", e.message);
    }
}

module.exports = {
    logActivity,
    readLogs,
    clearLogs
};
