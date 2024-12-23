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
    // Add detailed validation logging
    console.log('Sticker handler received:', {
        hasSock: !!sock,
        hasMessage: !!message,
        hasSenderId: !!senderId,
        messageType: message?.message ? Object.keys(message.message)[0] : null
    });

    if (!sock || !message || !senderId) {
        console.error('Missing required parameters in handleSticker');
        return;
    }

    try {
        let imageMessage = null;
        
        // Check for direct image
        if (message.message?.imageMessage) {
            imageMessage = message.message.imageMessage;
        }
        // Check for quoted image
        else if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            imageMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        }

        if (!imageMessage) {
            await sock.sendMessage(senderId, { 
                text: '❌ Kirim gambar dengan caption !sticker atau reply gambar dengan !sticker' 
            });
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

        await sock.sendMessage(senderId, {
            sticker: sticker
        });

        await sendReaction(sock, message, '✅');

    } catch (error) {
        console.error('Sticker creation error:', error);
        await sock.sendMessage(senderId, { 
            text: '❌ Gagal membuat sticker. Silakan coba lagi.' 
        });
    }
}

module.exports = { handleSticker };