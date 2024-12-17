const {  makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { handleMessage } = require('../handlers/messageHandler');
const { responses } = require('../commands/textResponses');
const config = require('../config/config');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.session.path);
    
    const sock = makeWASocket({
        syncFullHistory: false,
        markOnlineOnConnect: false,
        retryRequestDelayMs: 2000,
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
        if (message.key.fromMe) return;
    
        await handleMessage(sock, message);
    });
}

module.exports = { connectToWhatsApp };