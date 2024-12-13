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
    await sock.sendMessage(message.key.remoteJid, {
        react: {
            text: emoji,
            key: message.key
        }
    });
}

async function handleSticker(sock, message, senderId) {
    try {
        let imageMessage;
        
        // Check direct image with caption
        if (message.message.imageMessage) {
            const caption = message.message.imageMessage.caption || '';
            if (caption.toLowerCase().trim() === '!sticker') {
                imageMessage = message.message.imageMessage;
            }
        }
        
        // Check quoted image if no direct image
        if (!imageMessage) {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted?.imageMessage) {
                imageMessage = quoted.imageMessage;
            }
        }

        if (!imageMessage) {
            await sendReaction(sock, message, '❌');
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
    }
}

module.exports = { handleSticker };