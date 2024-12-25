const { handleAIQuery } = require('./handlers/aiHandler');

// ...existing code...

sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    
    // Debug full message
    console.log('Received message:', {
        type: msg?.messageType,
        key: msg?.key,
        message: msg?.message
    });
    
    if (isAICommand(msg)) {
        // Extra validation
        if (!msg?.key) {
            console.error('Message has no key property:', msg);
            return;
        }

        const messageKey = {
            id: msg.key.id || '',
            remoteJid: msg.key.remoteJid || '',
            fromMe: Boolean(msg.key.fromMe),
            participant: msg.key.participant || msg.key.remoteJid || ''
        };

        console.log('Sending message key:', messageKey);

        await handleAIQuery(
            sock,
            messageKey.remoteJid,
            msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
            0,
            messageKey
        );
    }
});

// Helper function to check if message is AI command
function isAICommand(msg) {
    const text = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '';
    // Add your AI command detection logic here, for example:
    return text.toLowerCase().startsWith('/ai');
}