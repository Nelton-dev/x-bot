//Saudaçẽs meu/minha nobre
const {
default: makeWASocket,
useMultiFileAuthState,
 DisconnectReason
} = require("@whiskeysockets/baileys");

const handler = require("./handler");
const P = require("pino");
const QRCode = require("qrcode-terminal");

async function start() {

const { state, saveCreds } =
 await useMultiFileAuthState("./sessions");

 const sock = makeWASocket({
   auth: state,
  logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

sock.ev.on("messages.upsert", async ({ messages }) => {

  const msg = messages[0];

  if (!msg.message) return;
  await handler(sock, msg);
});
 sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

 if (qr) {
  QRCode.generate(qr, { small: true });
   }

if (connection === "open") {
            console.log("\n X-BOT conectado!");
 }

 if (connection === "close") {

const reconnect =
 lastDisconnect?.error?.output?.statusCode !==
 DisconnectReason.loggedOut;

 if (reconnect) {
 start();
  }
  }

 });

}

module.exports = start;
/*Atenção meu nobre nada aqui é profissional, 
simplesmente feito para diversão, 
se não sabe o que é pode se retirar k-peta*/

/*NB: O comentário acima foi quando eu estava sentindo FOME, 
pórem não peço nenhuma merda de desculpas
BOM USO*/
/*ARQUIVO RESPONSÁVEL PELA CONEXÃO! Prontos sem mais comentários
 desnecessários*/

/*Se não está organizado, organiza você, eu não tive tempo de fazer tal 
desgraça, ó desocupado.
Se você leu  Até aqui preste atenção:
realmente você é um desocupado mesmo, e ainda continua lendo,
 ptz, você precisa ser estudado */
