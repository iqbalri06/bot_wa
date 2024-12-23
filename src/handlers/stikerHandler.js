// stickerHandler.js
const { downloadMediaMessage, proto } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function createSticker(buffer) {
    return await sharp(buffer)
        .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toBuffer();
}

async function sendReaction(sock, message, emoji) {
    if (!message?.key?.remoteJid) return;
    
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error sending reaction:', error);
    }
}

async function handleSticker(sock, message, senderId) {
    if (!message || !senderId) {
        console.error('Invalid message or senderId');
        return;
    }

    try {
        let imageMessage = null;
        
        // Check if message has a valid structure
        if (message.message) {
            // Check direct image with caption
            if (message.message.imageMessage) {
                imageMessage = message.message.imageMessage;
            }
            // Check quoted image
            else if (message.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                imageMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            }
        }

        if (!imageMessage) {
            await sendReaction(sock, message, '❌');
            await sock.sendMessage(senderId, { text: 'Please send an image or reply to an image with !sticker' });
            return;
        }

        // Processing reaction
        await sendReaction(sock, message, '⏳');

        const buffer = await downloadMediaMessage(
            { message: { imageMessage } },
            'buffer',
            {},
        );

        const sticker = await createSticker(buffer);

        // Success reaction
        await sendReaction(sock, message, '✅');

        await sock.sendMessage(senderId, {
            sticker: sticker
        });

    } catch (error) {
        console.error('Sticker creation error:', error);
        await sendReaction(sock, message, '❌');
        await sock.sendMessage(senderId, { text: 'Failed to create sticker. Please try again.' });
    }
}

module.exports = { handleSticker };