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

    try {
        let sent;

        if (['imageMessage', 'audioMessage', 'videoMessage', 'stickerMessage'].includes(messageType)) {
            const mediaData = await downloadMediaMessage(message, 'buffer');
            sent = await sendMediaReply(sock, targetId, messageType, mediaData, content, timestamp);
        } else {
            const text = content.extendedTextMessage.text;
            sent = await sock.sendMessage(targetId, {
                text: formatReplyMessage(timestamp, text)
            });
        }

        // Store new chat data with swapped sender/receiver for future replies
        chatData.set(sent.key.id, {
            sender: senderId,
            receiver: targetId,
            message: content.extendedTextMessage?.text || '',
            timestamp: timestamp,
            originalMessageId: quotedMessageId // Track original message
        });

        // Confirm message sent
        await sock.sendMessage(senderId, { 
            text: '✅ *Pesan berhasil diteruskan*\n\n_Terimakasih telah menggunakan bot ini_' 
        });

    } catch (err) {
        console.error('Error handling reply:', err);
        await sock.sendMessage(senderId, { text: responses.reply_failed });
    }
}

async function sendMediaReply(sock, targetId, messageType, mediaData, content, timestamp) {
    const replyTemplate = `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
                         `⏱️ *Waktu* : ${timestamp}\n\n`;

    const guideTemplate = `\n┌──「 ℹ️ Panduan Balasan 」──\n` +
                         `• Reply Stiker/Audio untuk membalas\n` +
                         `• Ketik pesan atau kirim media\n` +
                         `└─────────────────────┘`;

    try {
        let sent;
        
        switch(messageType) {
            case 'stickerMessage':
                sent = await sock.sendMessage(targetId, {
                    sticker: mediaData
                });
                
                await sock.sendMessage(targetId, {
                    text: replyTemplate + 
                         `✨ _Stiker Balasan telah dikirim_\n` +
                         guideTemplate
                });
                break;
                
            case 'audioMessage':
                sent = await sock.sendMessage(targetId, {
                    audio: mediaData,
                    mimetype: 'audio/mp4',
                    ptt: content.audioMessage?.ptt || false
                });
                
                await sock.sendMessage(targetId, {
                    text: replyTemplate + 
                         `✨ _Audio Balasan telah dikirim_\n` +
                         `⏱️ Durasi: ${content.audioMessage?.seconds || 0} detik\n` +
                         guideTemplate
                });
                break;
                
            case 'imageMessage':
                sent = await sock.sendMessage(targetId, {
                    image: mediaData,
                    caption: replyTemplate + 
                            `┌──「 💬 Pesan 」──\n` +
                            `❝\n${content.imageMessage?.caption || ''}\n❞\n\n` +
                            `✨ _Foto Balasan_\n` +
                            guideTemplate
                });
                break;
                
            case 'videoMessage':
                sent = await sock.sendMessage(targetId, {
                    video: mediaData,
                    caption: replyTemplate + 
                            `┌──「 💬 Pesan 」──\n` +
                            `❝\n${content.videoMessage?.caption || ''}\n❞\n\n` +
                            `✨ _Video Balasan_\n` +
                            guideTemplate,
                    gifPlayback: content.videoMessage?.gifPlayback || false
                });
                break;
                
            default:
                throw new Error('Tipe media tidak didukung');
        }

        return sent;

    } catch (error) {
        console.error('Error sending media reply:', error);
        throw error;
    }
}

module.exports = {
    handleReply
};