const { responses } = require('../commands/textResponses');
const config = require('../config/config');
const { handleRPSGame } = require('../games/rpsGame');

// Simpan data chat untuk melacak pengirim asli
const chatData = new Map();

async function handleMessage(sock, message) {
    const content = message.message;
    const messageType = Object.keys(content)[0];
    const senderId = message.key.remoteJid;

    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
        const text = messageType === 'conversation' ?
            content.conversation :
            content.extendedTextMessage.text;

        // Handle prefix commands
        if (text.startsWith(config.prefix)) {
            const [cmd, ...args] = text.slice(config.prefix.length).trim().split(' ');

            // Handle send command
            if (cmd === 'kirim') {
                const number = args[0];
                const messageText = args.slice(1).join(' ');

                if (!number || !messageText) {
                    await sock.sendMessage(senderId, {
                        text: responses.invalid_format
                    });
                    return;
                }

                const formattedNumber = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
                const timestamp = new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour12: false
                });

                const formattedMessage = `┌─────「 📨 *PESAN BARU* 」────┐

⏱️ *Waktu* : ${timestamp}
👤 *Dari* : Anonim 

┌──「 💭 Pesan 」──
❝
${messageText}
❞

┌──「 ℹ️ Panduan 」──
• *Reply* pesan ini
• Ketik balasan Anda
• Kirim seperti biasa

_↪️ Gunakan fitur Balas untuk mengirim pesan_
└───────────────────────┘`;

                try {
                    // Kirim pesan ke penerima
                    const sent = await sock.sendMessage(formattedNumber, {
                        text: formattedMessage
                    });

                    // Simpan data chat untuk melacak pengirim asli
                    chatData.set(sent.key.id, {
                        sender: senderId,
                        receiver: formattedNumber
                    });

                    await sock.sendMessage(senderId, {
                        text: responses.send_success
                    });
                } catch (err) {
                    await sock.sendMessage(senderId, {
                        text: responses.send_failed
                    });
                }
                return;
            }
        }

        // Add to command handler
        if (text.startsWith('!suit') || text === '!rps') {
            await handleRPSGame(sock, senderId, text);
            return;
        }

        // In your message handler
        if (text === '!suit' || ['batu', 'gunting', 'kertas'].includes(text.toLowerCase().trim())) {
            await handleRPSGame(sock, senderId, text);
            return;
        }

        // Handle balasan pesan
        if (message.message?.extendedTextMessage?.contextInfo?.stanzaId) {
            const quotedMessageId = message.message.extendedTextMessage.contextInfo.stanzaId;
            const chatInfo = chatData.get(quotedMessageId);

            if (chatInfo) {
                const timestamp = new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour12: false
                });

                // Format pesan balasan
                const replyMessage = `┌─────「 ✉️ *BALASAN* 」─────┐

⏱️ *Waktu* : ${timestamp}
👤 *Dari* : Penerima

┌──「 💬 Pesan 」──
❝
${text}
❞

✨ _Penerima Mengirim Balasan_
└─────────────────────┘`;

                try {
                    // Kirim balasan ke pengirim asli
                    await sock.sendMessage(chatInfo.sender, {
                        text: replyMessage
                    });

                    // Kirim konfirmasi ke pengirim balasan
                    await sock.sendMessage(senderId, {
                        text: '✅ *Balasan Anda telah terkirim*\n\n_Terimakasih telah menggunakan bot ini_'
                    });

                    // Hapus data chat setelah balasan terkirim
                    chatData.delete(quotedMessageId);
                } catch (err) {
                    await sock.sendMessage(senderId, {
                        text: responses.reply_failed
                    });
                }
            }
        }
    }
}

module.exports = { handleMessage };