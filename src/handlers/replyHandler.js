const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { formatReplyMessage } = require('../utils/messageFormatter');
const { responses } = require('../commands/textResponses');
const { chatData } = require('./sendHandler');

async function handleReply(sock, message, senderId) {
    const content = message.message;
    const messageType = Object.keys(content)[0];
    
    // Get quoted message ID
    const quotedMessageId = messageType === 'extendedTextMessage' 
        ? content.extendedTextMessage.contextInfo.stanzaId
        : content[messageType]?.contextInfo?.stanzaId;

    // Get chat info from stored data
    const chatInfo = chatData.get(quotedMessageId);
    if (!chatInfo) return;

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
    const targetId = senderId === chatInfo.sender ? chatInfo.receiver : chatInfo.sender;
    const originalMessage = chatInfo.message; // Get the original message text

    try {
        let sent;
        let messageContent = '';

        if (['stickerMessage', 'audioMessage'].includes(messageType)) {
            const mediaData = await downloadMediaMessage(message, 'buffer');
            
            // 1. Forward the media first
            sent = await sock.sendMessage(targetId, {
                [messageType === 'stickerMessage' ? 'sticker' : 'audio']: mediaData,
                ...(messageType === 'audioMessage' && {
                    mimetype: 'audio/mp4',
                    ptt: content.audioMessage?.ptt || false
                })
            });

            // 2. Send context message separately
            const infoText = `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
                           `⏱️ *Waktu* : ${timestamp}\n\n` +
                           `💬 *Pesan yang dibalas*:\n❝\n${originalMessage}\n❞\n\n` +
                           `✨ _Membalas dengan ${messageType === 'stickerMessage' ? 'Stiker' : 'Audio'}_` +
                           (messageType === 'audioMessage' && content.audioMessage?.seconds ? 
                           `\n⏱️ Durasi: ${content.audioMessage.seconds} detik` : '');

            await sock.sendMessage(targetId, { text: infoText });
            
            messageContent = messageType === 'stickerMessage' ? '[Sticker Reply]' : '[Audio Reply]';

        } else if (['imageMessage', 'videoMessage'].includes(messageType)) {
            const mediaData = await downloadMediaMessage(message, 'buffer');
            messageContent = content[messageType]?.caption || `[${messageType.replace('Message', '')} Reply]`;
            sent = await sendMediaReply(sock, targetId, messageType, mediaData, content, timestamp, originalMessage);
        } else {
            messageContent = content.extendedTextMessage.text;
            sent = await sock.sendMessage(targetId, {
                text: formatReplyMessage(timestamp, messageContent, originalMessage)
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
}

// Simplify sendMediaReply since we're handling media directly in handleReply
async function sendMediaReply(sock, targetId, messageType, mediaData, content, timestamp, originalMessage) {
    // Only used for image and video captions now
    const replyTemplate = `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
                         `⏱️ *Waktu* : ${timestamp}\n\n` +
                         `💬 *Pesan yang dibalas*:\n❝\n${originalMessage}\n❞\n\n`;

    try {
        const mediaCaption = content[messageType]?.caption;
        return await sock.sendMessage(targetId, {
            [messageType === 'imageMessage' ? 'image' : 'video']: mediaData,
            caption: replyTemplate + 
                    (mediaCaption ? `┌──「 💬 Pesan 」──\n❝\n${mediaCaption}\n❞\n\n` : '') +
                    `✨ _${messageType === 'imageMessage' ? 'Foto' : 'Video'} Balasan_`,
            ...(messageType === 'videoMessage' && {
                gifPlayback: content.videoMessage?.gifPlayback || false
            })
        });
    } catch (error) {
        console.error('Error sending media reply:', error);
        throw error;
    }
}

module.exports = {
    handleReply
};