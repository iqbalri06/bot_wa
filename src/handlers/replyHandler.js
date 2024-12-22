const { downloadMediaMessage, MessageType, MessageOptions, Mimetype } = require('@whiskeysockets/baileys');
const { formatReplyMessage } = require('../utils/messageFormatter');
const { responses } = require('../commands/textResponses');
const { chatData } = require('./sendHandler');

async function handleReply(sock, message, senderId) {
    try {
        console.log('Processing reply with message:', JSON.stringify(message, null, 2));
        
        if (!message || !message.message) {
            throw new Error('Empty message content');
        }

        const content = message.message;
        const messageType = Object.keys(content)[0];
        
        // Get quoted message ID with proper error handling
        const quotedMessageId = messageType === 'extendedTextMessage' 
            ? content.extendedTextMessage?.contextInfo?.stanzaId
            : content[messageType]?.contextInfo?.stanzaId;

        console.log('Quoted message ID:', quotedMessageId);

        if (!quotedMessageId) {
            throw new Error('Invalid quoted message');
        }

        // Get chat info from stored data
        const chatInfo = chatData.get(quotedMessageId);
        if (!chatInfo) {
            console.log('Chat info not found for ID:', quotedMessageId);
            return;
        }

        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
        const targetId = senderId === chatInfo.sender ? chatInfo.receiver : chatInfo.sender;
        const originalMessage = chatInfo.message; // Get the original message text

        try {
            let sent;
            let messageContent = '';

            if (messageType === 'imageMessage') {
                try {
                    const mediaData = await downloadMediaMessage(
                        message,
                        'buffer',
                        {},
                        { 
                            logger: console,
                            reuploadRequest: sock.updateMediaMessage
                        }
                    );

                    if (!mediaData) {
                        throw new Error('Failed to download media');
                    }

                    const caption = content.imageMessage?.caption;
                    const replyTemplate = `*PESAN BALASAN*\n` +
                                        `━━━━━━━━━━━━━━━\n` +
                                        `📩 *Status* : Diteruskan\n` +
                                        `⏰ *Waktu* : ${timestamp}\n` +
                                        `\n💭 *Pesan Sebelumnya*:\n${originalMessage}\n` +
                                        (caption ? `\n📝 *Caption Foto*:\n${caption}\n` : '') +
                                        `━━━━━━━━━━━━━━━\n` +
                                        `*PANDUAN MEMBALAS*:\n` +
                                        `1️⃣ Reply/balas foto yang dikirim\n` +
                                        `2️⃣ Ketik pesan atau kirim:\n` +
                                        `   ◦ Foto (dengan/tanpa caption)\n` +
                                        `   ◦ Audio/VN\n` +
                                        `   ◦ Stiker\n` +
                                        `   ◦ Teks biasa`;

                    // Send image with combined caption
                    sent = await sock.sendMessage(targetId, {
                        image: mediaData,
                        caption: replyTemplate
                    });

                    messageContent = caption || '[Image Reply]';

                } catch (mediaError) {
                    console.error('Image handling error:', mediaError);
                    throw mediaError;
                }
            } else if (['stickerMessage', 'audioMessage', 'videoMessage'].includes(messageType)) {
                try {
                    const mediaData = await downloadMediaMessage(
                        message,
                        'buffer',
                        {},
                        { 
                            logger: console,
                            reuploadRequest: sock.updateMediaMessage
                        }
                    );

                    if (!mediaData) {
                        throw new Error('Failed to download media');
                    }

                    const mediaMessage = {
                        [messageType.replace('Message', '')]: mediaData,
                        ...(messageType === 'audioMessage' && {
                            mimetype: 'audio/mp4',
                            ptt: content.audioMessage?.ptt || false
                        })
                    };

                    sent = await sock.sendMessage(targetId, mediaMessage);
                    
                    // Send context message after successful media send
                    const infoText = `*PESAN BALASAN*\n` +
                                   `━━━━━━━━━━━━━━━\n` +
                                   `📩 *Status* : Diteruskan\n` +
                                   `⏰ *Waktu* : ${timestamp}\n` +
                                   `📤 *Tipe* : ${messageType === 'stickerMessage' ? 'Stiker' : 'Audio/VN'}\n` +
                                   (messageType === 'audioMessage' && content.audioMessage?.seconds ? 
                                   `⏱️ *Durasi* : ${content.audioMessage.seconds} detik\n` : '') +
                                   `\n💭 *Pesan Sebelumnya*:\n${originalMessage}\n` +
                                   `━━━━━━━━━━━━━━━\n` +
                                   `*PANDUAN MEMBALAS*:\n` +
                                   `1️⃣ Reply/balas audio/stiker yang dikirim\n` +
                                   `2️⃣ Ketik pesan atau kirim:\n` +
                                   `   ◦ Foto (dengan/tanpa caption)\n` +
                                   `   ◦ Audio/VN\n` +
                                   `   ◦ Stiker\n` +
                                   `   ◦ Teks biasa`;

                    await sock.sendMessage(targetId, { text: infoText });
                    
                    messageContent = messageType === 'stickerMessage' ? '[Sticker Reply]' : '[Audio Reply]';

                } catch (mediaError) {
                    console.error('Media handling error:', mediaError);
                    throw mediaError;
                }
            } else {
                messageContent = content.extendedTextMessage.text;
                sent = await sock.sendMessage(targetId, {
                    text: `*PESAN BALASAN*\n` +
                         `━━━━━━━━━━━━━━━\n` +
                         `📩 *Status* : Diteruskan\n` +
                         `⏰ *Waktu* : ${timestamp}\n` +
                         `\n💬 *Balasan*:\n${messageContent}\n` +
                         `\n💭 *Pesan Sebelumnya*:\n${originalMessage}\n` +
                         `━━━━━━━━━━━━━━━\n` +
                         `*PANDUAN MEMBALAS*:\n` +
                         `1️⃣ Reply/balas pesan ini\n` +
                         `2️⃣ Ketik pesan atau kirim:\n` +
                         `   ◦ Foto (dengan/tanpa caption)\n` +
                         `   ◦ Audio/VN\n` +
                         `   ◦ Stiker\n` +
                         `   ◦ Teks biasa`
                });
            }

            // Store chat data
            if (sent?.key?.id) {
                chatData.set(sent.key.id, {
                    sender: senderId,
                    receiver: targetId,
                    message: messageContent,
                    timestamp: timestamp,
                    originalMessageId: quotedMessageId
                });
            }

            // Confirm message sent
            await sock.sendMessage(senderId, { 
                text: '✅ *Pesan berhasil diteruskan*\n\n_Terimakasih telah menggunakan bot ini_' 
            });

        } catch (err) {
            console.error('Error handling reply:', err);
            await sock.sendMessage(senderId, { text: responses.reply_failed });
        }

    } catch (err) {
        console.error('Reply handler error:', err);
        await sock.sendMessage(senderId, { 
            text: `${responses.reply_failed}\n\nError: ${err.message}` 
        });
    }
}

// Remove or simplify sendMediaReply since we're handling image directly
async function sendMediaReply(sock, targetId, messageType, mediaData, content, timestamp, originalMessage) {
    if (messageType === 'videoMessage') {
        // Keep video handling logic
        const replyTemplate = `*PESAN BALASAN*\n` +
                             `━━━━━━━━━━━━━━━\n` +
                             `📩 *Status* : Diteruskan\n` +
                             `⏰ *Waktu* : ${timestamp}\n` +
                             `📤 *Tipe* : Video\n` +
                             (mediaCaption ? `\n📝 *Caption*:\n${mediaCaption}\n` : '') +
                             `\n💭 *Pesan Sebelumnya*:\n${originalMessage}\n` +
                             `━━━━━━━━━━━━━━━\n` +
                             `*PANDUAN MEMBALAS*:\n` +
                             `1️⃣ Reply/balas foto yang dikirim\n` +
                             `2️⃣ Ketik pesan atau kirim:\n` +
                             `   ◦ Foto (dengan/tanpa caption)\n` +
                             `   ◦ Audio/VN\n` +
                             `   ◦ Stiker\n` +
                             `   ◦ Teks biasa`;

        try {
            const mediaCaption = content[messageType]?.caption;
            return await sock.sendMessage(targetId, {
                [messageType === 'imageMessage' ? 'image' : 'video']: mediaData,
                caption: replyTemplate + 
                        (mediaCaption ? `┌──「 💬 Pesan 」──\n❝\n${mediaCaption}\n❞\n\n` : '') +
                        `✨ _${messageType === 'imageMessage' ? 'Foto' : 'Video'} Balasan_`,
                ...(messageType === 'videoMessage' && {
                    gifPlayback: content.videoMessage?.gifPlayback || false,
                    ptt: false
                })
            });
        } catch (error) {
            console.error('Error sending media reply:', error);
            throw error;
        }
    } else {
        throw new Error('Unsupported media type');
    }
}

module.exports = {
    handleReply
};