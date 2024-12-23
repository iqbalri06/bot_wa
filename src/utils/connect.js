const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { handleMessage } = require('../handlers/messageHandler');
const { responses } = require('../commands/textResponses');
const config = require('../config/config');
const { makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
let logger;
try {
    logger = require('../logger');
} catch (error) {
    logger = console; // Fallback to console if logger module is not found
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connectToWhatsApp(retryCount = 0) {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(config.session.path);
        
        const sock = makeWASocket({
            printQRInTerminal: true,
            syncFullHistory: false,
            markOnlineOnConnect: true, // Changed to true to show online status
            connectTimeoutMs: 60000,
            retryRequestDelayMs: 1000, // Reduced delay for faster reconnection
            auth: state,
            browser: [config.botInfo.name, 'Chrome', config.botInfo.version],
            defaultQueryTimeoutMs: 60000, // Add timeout for queries
            keepAliveIntervalMs: 10000, // Add keep-alive interval
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            // Add message retries
            msgRetryCounterMap: {},
            generateHighQualityLinkPreview: true
        });

        // Add custom message processing
        const processMessage = async (msg) => {
            try {
                if (msg.message) {
                    // Basic message preprocessing here if needed
                    return msg;
                }
                return msg;
            } catch (error) {
                logger.error('Error processing message:', error);
                return msg;
            }
        };

        // Connection update handler
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed due to:', lastDisconnect?.error, '\nReconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    connectToWhatsApp(); // Recursive reconnection
                }
            } else if (connection === 'connecting') {
                console.log('Connecting to WhatsApp...');
            } else if (connection === 'open') {
                console.log('Connected successfully!');
            }
            
            // Save credentials whenever updated
            if (update.qr) {
                console.log('New QR code generated:', qr);
            }
        });

        // Automatically save session credentials
        sock.ev.on('creds.update', async () => {
            await saveCreds();
        });

        // Handle errors globally
        sock.ev.on('error', async (error) => {
            console.error('Connection error:', error);
            await connectToWhatsApp(); // Attempt to reconnect
        });

        // Update message handling
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            try {
                const message = messages[0];
                if (!message) return;
                
                const processedMessage = await processMessage(message);
                await handleMessage(sock, processedMessage);
            } catch (error) {
                logger.error('Error in message handling:', error);
            }
        });

        return sock;
    } catch (error) {
        logger.error('Failed to connect:', error);
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => connectToWhatsApp(retryCount + 1), backoffDelay);
    }
}

module.exports = { connectToWhatsApp };