// stickerHandler.js
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
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

async function addTextToSticker(buffer, text) {
    if (!text) return buffer;

    try {
        const image = await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });

        // Improve text wrapping logic
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        // Reduce max chars per line to accommodate larger font
        const maxCharsPerLine = text.length > 30 ? 15 : 12;
        
        for (const word of words) {
            if ((currentLine + word).length > maxCharsPerLine) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }
        lines.push(currentLine.trim());

        // Larger base font size and adjusted scaling
        const fontSize = Math.max(65 - (lines.length * 8), 35);
        const lineHeight = fontSize + 15;
        const startY = 512 - (lines.length * lineHeight) - 30;

        const svgText = lines
            .map((line, i) => `
                <text 
                    x="50%" 
                    y="${startY + (i * lineHeight)}px" 
                    text-anchor="middle" 
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="${fontSize}px" 
                    font-weight="bold" 
                    stroke="black" 
                    stroke-width="6"
                    fill="white"
                    style="paint-order: stroke fill"
                >${line}</text>
            `)
            .join('');

        const svg = `
            <svg width="512" height="512">
                ${svgText}
            </svg>`;

        return await image
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }])
            .webp({ quality: 80 })
            .toBuffer();

    } catch (error) {
        console.error('Error adding text to sticker:', error);
        return buffer;
    }
}

async function handleSticker(sock, message, senderId, messageType) {
    console.log('Sticker handler received:', {
        hasMessage: !!message,
        hasMessageContent: !!message?.message,
        messageType: messageType,
        messageKeys: message?.message ? Object.keys(message.message) : []
    });
    
    if (!sock || !message || !senderId) {
        console.error('Missing required parameters in handleSticker');
        return;
    }

    try {
        let mediaMessage = null;
        let stickerText = '';

        // Get text from command if exists
        if (message.message?.conversation) {
            stickerText = message.message.conversation.split('!sticker ')[1] || '';
        } else if (message.message?.imageMessage?.caption) {
            stickerText = message.message.imageMessage.caption.split('!sticker ')[1] || '';
        }

        // Enhanced message detection
        if (message.message) {
            const msg = message.message;
            
            if (msg.imageMessage) {
                mediaMessage = {
                    message: { imageMessage: msg.imageMessage }
                };
                messageType = 'image';
            } 
            else if (msg.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedMsg = msg.extendedTextMessage.contextInfo.quotedMessage;
                if (quotedMsg.imageMessage) {
                    mediaMessage = {
                        message: { imageMessage: quotedMsg.imageMessage }
                    };
                    messageType = 'quotedImage';
                }
                else if (quotedMsg.videoMessage) {
                    mediaMessage = {
                        message: { videoMessage: quotedMsg.videoMessage }
                    };
                    messageType = 'quotedVideo';
                }
            }
        }

        console.log('Media analysis:', {
            type: messageType,
            hasMedia: !!mediaMessage
        });

        if (!mediaMessage) {
            await sock.sendMessage(senderId, { 
                text: '❌ Kirim gambar/video dengan caption !sticker atau reply gambar/video dengan !sticker' 
            });
            return;
        }

        await sendReaction(sock, message, '⏳');

        const buffer = await downloadMediaMessage(
            mediaMessage,
            'buffer',
            {}
        );

        // Create sticker with text
        const processedBuffer = await addTextToSticker(buffer, stickerText);
        const sticker = await createSticker(processedBuffer);

        await sock.sendMessage(senderId, {
            sticker: sticker
        });

        await sendReaction(sock, message, '✅');

    } catch (error) {
        console.error('Sticker creation error:', {
            error: error.message,
            stack: error.stack
        });
        await sock.sendMessage(senderId, { 
            text: '❌ Gagal membuat sticker. Silakan coba lagi.' 
        });
    }
}

module.exports = { handleSticker };