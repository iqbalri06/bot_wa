const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { handleMessage } = require('../handlers/messageHandler');
const { responses } = require('../commands/textResponses');
const config = require('../config/config');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.session.path);
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        browser: [config.botInfo.name, 'Chrome', config.botInfo.version]
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log(`${config.botInfo.name} connected successfully!`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message.message) return;

        const content = message.message;
        const messageType = Object.keys(content)[0];
        const senderId = message.key.remoteJid;

        // Handle text messages
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const text = messageType === 'conversation' ? 
                content.conversation : 
                content.extendedTextMessage.text;

            const cmd = text.toLowerCase();

            // Check if command exists in responses
            if (responses[cmd]) {
                await sock.sendMessage(senderId, {
                    text: responses[cmd]
                });
                return;
            }
        }

        // Handle other message types
        await handleMessage(sock, message);
    });
}

module.exports = { connectToWhatsApp };