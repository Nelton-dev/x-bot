const start = require("./src/connection");

start().catch(err => {
    console.error("Falha ao iniciar o X-BOT:", err);
    process.exit(1);
});
