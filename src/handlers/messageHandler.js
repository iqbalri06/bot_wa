const { responses } = require('../commands/textResponses');
const config = require('../config/config');
const { handleRPSGame } = require('../games/rpsGame');
const { handleTiktokCommand } = require('../handlers/tiktokHandler');
const { handleInstagramCommand} = require('../handlers/instagramHandler');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Store chat data to track original senders
const chatData = new Map();

async function handleMessage(sock, message) {
    const content = message.message;
    const messageType = Object.keys(content)[0];
    const senderId = message.key.remoteJid;
    
    // Extract text content
    let text = '';
    if (messageType === 'conversation') {
        text = content.conversation;
    } else if (messageType === 'extendedTextMessage') {
        text = content.extendedTextMessage.text;
    } else if (messageType === 'imageMessage') {
        text = content.imageMessage.caption || '';
    }

    // Handle commands
    if (text.startsWith('!ig ')) {
        await handleInstagramCommand(sock, senderId, text.slice(4).trim());
        return;
    }

    if (text.startsWith('!tt ')) {
        await handleTiktokCommand(sock, senderId, text.slice(4).trim());
        return;
    }

    if (text.startsWith('!suit') || text === '!rps' || ['batu', 'gunting', 'kertas'].includes(text.toLowerCase().trim())) {
        await handleRPSGame(sock, senderId, text);
        return;
    }

    // Handle send command
    if (text.startsWith(config.prefix + 'kirim')) {
        await handleSendCommand(sock, senderId, text);
        return;
    }

    // Handle replies
    if (message.message?.extendedTextMessage?.contextInfo?.stanzaId || 
        message.message?.imageMessage?.contextInfo?.stanzaId ||
        message.message?.audioMessage?.contextInfo?.stanzaId ||
        message.message?.videoMessage?.contextInfo?.stanzaId ||
        message.message?.stickerMessage?.contextInfo?.stanzaId) {
        await handleReply(sock, message, senderId);
    }
}

async function handleSendCommand(sock, senderId, text) {
    const [cmd, number, ...args] = text.slice(config.prefix.length).trim().split(' ');
    const messageText = args.join(' ');

    if (!number || !messageText) {
        await sock.sendMessage(senderId, { text: responses.invalid_format });
        return;
    }

    const formattedNumber = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });

    try {
        // Kirim pesan dengan banner
        const sent = await sock.sendMessage(formattedNumber, {
            image: { url: './asset/img/banner_pesan.png' },
            caption: formatNewMessage(timestamp, messageText)
        });
        
        chatData.set(sent.key.id, { sender: senderId, receiver: formattedNumber });
        await sock.sendMessage(senderId, { text: responses.send_success });
    } catch (err) {
        console.error('Error sending message:', err);
        await sock.sendMessage(senderId, { text: responses.send_failed });
    }
}

async function handleReply(sock, message, senderId) {
    const content = message.message;
    const messageType = Object.keys(content)[0];
    
    let quotedMessageId;
    if (messageType === 'extendedTextMessage') {
        quotedMessageId = content.extendedTextMessage.contextInfo.stanzaId;
    } else if (['imageMessage', 'audioMessage', 'videoMessage', 'stickerMessage'].includes(messageType)) {
        quotedMessageId = content[messageType].contextInfo.stanzaId;
    }

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

        chatData.set(sent.key.id, { sender: senderId, receiver: targetId });
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
                         `• Reply pesan ini untuk membalas\n` +
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

function formatNewMessage(timestamp, messageText) {
    return `┌───「 📨 *PESAN BARU* 」──┐\n\n` +
           `⏱️ *Waktu* : ${timestamp}\n` +
           `👤 *Dari* : Anonim\n\n` +
           `┌──「 💭 Pesan 」──\n❝\n${messageText}\n❞\n\n` +
           `┌──「 ℹ️ Panduan 」──\n` +
           `• *Reply* pesan ini\n` +
           `• Ketik balasan/kirim media\n` +
           `• Kirim seperti biasa\n\n` +
           `_↪️ Gunakan fitur Balas untuk mengirim pesan_\n` +
           `└─────────────────────┘`;
}

function formatReplyMessage(timestamp, text) {
    return `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
           `⏱️ *Waktu* : ${timestamp}\n\n` +
           `┌──「 💬 Pesan 」──\n❝\n${text}\n❞\n\n` +
           `✨ _Pesan Balasan_\n` +
           `└─────────────────────┘`;
}

module.exports = { handleMessage };