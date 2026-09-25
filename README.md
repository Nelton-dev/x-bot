# X-BOT

Bot para WhatsApp em Node.js, construído com a biblioteca [Baileys](https://github.com/whiskeysockets/baileys).

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
npm install
```

## Arranque

```bash
npm start
```

No primeiro arranque, o bot gera um QR code no terminal. Escaneia-o com o WhatsApp ( 메뉴 → Estados vinculados → Vincular dispositivo ao estado ) ou usa a opção "Vincular a um dispositivo" no telemóvel para continuar.

A sessão é persistida em `./sessions/` — depois de autenticado, basta rodar `npm start` normalmente.

## Comandos

O prefixo por defeito é **`!`**.

| Comando | Descrição |
|---|---|
|| `!ping` | Responde com "Pong!" e a data/hora atuais |
|| `!menu` / `!help` / `!comandos` | Lista todos os comandos disponíveis |
|| `!status` / `!estado` / `!info` / `!botinfo` | Mostra estado do bot (versão, uptime, IP, Node.js) |
|| `!groupinfo` / `!infogroup` | Mostra informações do grupo atual (nome, descrição, membros, bot é admin?) |
|| `!admins` / `!admin` | Lista os administradores do grupo |
|| `!members` / `!membros` | Conta membros do grupo; com `-l` lista (até 50) |
|| `!scratch` / `!sorteio` | Sorteia um membro aleatório (exclui bot; `-bot` inclui) |
|| `!destino` / `!equipas` | Divide grupo em N equipas aleatórias (default 2) |
|| `!vota` / `!poll` | Cria votação com várias opções |
|| `!moeda` / `!coin` | Lança moeda (Cara/Coroa) |
|| `!dado` / `!roll` | Rola dado com N faces (default 6) |
|| `!horarios` / `!timezones` | Mostra hora atual em 15 fusos horários |
|| `!kick` / `!expulsar` | Remove membro (requer admin) |
|| `!ban` / `!baneirar` | Remove + banimento (requer admin) |
|| `!settopic` / `!tópico` | Altera tópico do grupo (requer admin) |
|| `!setdesc` / `!descricao` | Altera descrição do grupo (requer admin) |

Mais comandos podem ser adicionados colocando ficheiros `.js` na pasta `src/comandos/`.

## Adicionar um comando

Um comando é um módulo Node.js que exporta `name`, `description` (opcional), `aliases` (opcional) e `execute`.

```js
// src/comandos/ola.js
module.exports = {
    name: "ola",
    aliases: ["hey"],
    description: "Saudação simples",
    async execute(sock, msg, args) {
        await sock.sendMessage(
            msg.key.remoteJid,
            { text: "Olá! 👋" },
            { quoted: msg }
        );
    }
};
```

O handler descobre automaticamente os ficheiros em `src/comandos/` — basta adicionar o ficheiro e o comando fica disponível.

## Prefixo

O prefixo de comandos é `!` (ver `src/handler.js`, linha `text.startsWith("!")`). Para mudar, altera essa linha.

## Repetir media citada (reacção com emoji)

Para repetir uma imagem ou vídeo que foi citada, envia uma mensagem que contém **apenas um ou mais emojis** (ex: `❤️`, `🔥`, `😂`, `👍🏿`) ou o carácter `.` como mensagem curta, citando a mensagem com media. O bot detecta isso, descarrega o media citado e envia-o de volta para ti.

Exemplo:
1. Cita uma imagem ou vídeo
2. Envia uma mensagem com apenas `❤️` (ou qualquer emoji) como texto
3. O bot repete o media para ti

Esta funcionalidade não usa as reações nativas do WhatsApp (que o Baileys não expõe para deteção), mas sim uma mensagem texto com emoji como substituto.

## Limitações

- Projeto hobbysta — não é solução profissional.
- **Comandos de grupo:** alguns comandos requerem que o bot seja admin do grupo (`!kick`, `!ban`, `!settopic`, `!setdesc`). Outros funcionam independentemente (`!groupinfo`, `!members`, `!scratch`, `!destino`, `!vota`, etc.).
- Sessões em `./sessions/` são sensíveis — não as partilhes nem as versiones no git.

## Privacidade e Segurança

### O que é seguro

- **Imagens, vídeos e áudios normais (não viewOnce):** o bot descarrega o media citado e envia uma cópia para o teu próprio número. O remetente **não recebe qualquer notificação** de que o media foi copiado. Não existe no protocolo WhatsApp qualquer alerta de "ficheiro baixado" ou "copiado".

- **A repetição para si mesmo:** o bot envia o media de volta para o teu JID. Do ponto de vista do remetente, vê apenas uma nova mensagem no chat, sem indicação de origem.

### O que é incerto (viewOnce)

- **Mensagens de visualização única** (imagem/vídeo/áudio viewOnce): o protocolo viewOnce rastreia se a mensagem foi "vista" pelo destinatário. Ao usar `downloadContentFromMessage`, não está garantido se isso conta ou não como consumo da mensagem no sentido do protocolo.

  - Se o download **não** contar como vista: a mensagem pode permanecer marcada como "não vista" enquanto já foi descarregada — situação inconsistente com o comportamento esperado.
  - Se o download **contar** como vista: o remetente verá "visto" no status da mensagem (mas ainda assim não saberá que foi copiada, apenas que foi aberta).

- **Não existe forma de "salvar sem vista"** ao nível do protocolo WhatsApp com o Baileys no estado atual. O download de viewOnce pode deixar vestígios de consumo visíveis no protocolo de status da mensagem.

### Recomendação

Se a privacidade do remetente for critério absoluto, evita interagir com mensagens viewOnce através do bot. Para media normais, não há risco de notificação ao remetente.

## Dependências

- `@whiskeysockets/baileys` — protocolo WhatsApp Web
- `pino` — logger
- `qrcode-terminal` — geração de QR code para autenticação

## Licença

MIT
