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

// Add cleanup function
async function cleanupSession(sessionPath) {
    try {
        const fs = require('fs');
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log('Session cleaned up due to conflict');
        }
    } catch (err) {
        console.error('Session cleanup failed:', err);
    }
}

async function connectToWhatsApp(retryCount = 0) {
    try {
        // Check if other instance is running by trying to read the other environment's auth file
        const fs = require('fs');
        const otherEnvPath = process.env.NODE_ENV === 'development' ? 
            config.environment.productionSession :
            config.environment.developmentSession;

        const isOtherInstanceActive = fs.existsSync(otherEnvPath);
        
        if (isOtherInstanceActive && config.maintenance.forceMaintenanceOnDualLogin) {
            config.maintenance.enabled = true;
            console.log('Other instance detected - enabling maintenance mode');
        }

        const { state, saveCreds } = await useMultiFileAuthState(config.session.path);
        
        const sock = makeWASocket({
            printQRInTerminal: true,
            syncFullHistory: false,
            markOnlineOnConnect: false, // Changed to false to prevent conflicts
            connectTimeoutMs: 30000, // Reduced timeout
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: [config.botInfo.name, 'Chrome', config.botInfo.version],
            defaultQueryTimeoutMs: 30000, // Reduced timeout
            keepAliveIntervalMs: 15000, // Increased interval
            retryRequestDelayMs: 2000, // Increased delay
            msgRetryCounterMap: {},
            generateHighQualityLinkPreview: false, // Set to false to reduce load
            // Add these options for better stream handling
            patchMessageBeforeSending: msg => {
                const requiresPatch = !!(
                    msg.buttonsMessage || msg.templateMessage || msg.listMessage
                );
                if (requiresPatch) {
                    msg = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2 }, ...msg } } };
                }
                return msg;
            }
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
            
            const envPrefix = process.env.NODE_ENV === 'development' ? '[DEV] ' : '[PROD] ';
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log('Connection closed due to:', lastDisconnect?.error);

                // Handle stream error specifically
                if (statusCode === 440) {
                    console.log('Stream conflict detected, cleaning up session...');
                    await cleanupSession(config.session.path);
                    await delay(5000); // Wait 5 seconds before reconnecting
                    return connectToWhatsApp(0); // Reset retry count after cleanup
                }
                
                if (shouldReconnect) {
                    // Add exponential backoff
                    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                    console.log(`Reconnecting in ${backoffDelay/1000} seconds...`);
                    setTimeout(() => connectToWhatsApp(retryCount + 1), backoffDelay);
                } else {
                    console.log('Connection closed permanently');
                    process.exit(1);
                }
            } else if (connection === 'connecting') {
                console.log(envPrefix + 'Connecting to WhatsApp...' + 
                    (config.maintenance.enabled ? ' (MAINTENANCE MODE)' : ''));
            } else if (connection === 'open') {
                console.log(envPrefix + 'Connected successfully!' + 
                    (config.maintenance.enabled ? ' (MAINTENANCE MODE)' : ''));
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

        // Enhanced error handling
        sock.ws.on('error', async (err) => {
            console.error('WebSocket Error:', err);
            if (err.message.includes('Stream Errored')) {
                await cleanupSession(config.session.path);
                process.exit(1); // Force restart to clean up everything
            }
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

        // Add connection cleanup on process exit
        process.on('SIGINT', async () => {
            console.log('Closing connection...');
            if (sock) {
                try {
                    await sock.end();
                    await sock.logout();
                } catch (err) {
                    console.error('Error during cleanup:', err);
                }
            }
            process.exit(0);
        });

        return sock;
    } catch (error) {
        logger.error('Failed to connect:', error);
        if (error.message.includes('Stream Errored')) {
            await cleanupSession(config.session.path);
            await delay(5000);
            return connectToWhatsApp(0);
        }
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => connectToWhatsApp(retryCount + 1), backoffDelay);
    }
}

module.exports = { connectToWhatsApp };