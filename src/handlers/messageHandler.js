const { responses } = require('../commands/textResponses');
const config = require('../config/config');
const { handleRPSGame } = require('../games/rpsGame');
const { handleTiktokCommand } = require('../handlers/tiktokHandler');
const { handleInstagramCommand} = require('../handlers/instagramHandler');

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

┌──「 ℹ️ Panduan Membalas 」──
1️⃣ Tekan dan tahan pesan ini
2️⃣ Pilih 'Reply/Balas'
3️⃣ Tulis balasan Anda
4️⃣ Tekan tombol kirim

⚠️ *Pesan ini hanya dapat dibalas satu kali*
_↪️ Balas pesan ini untuk mengirim balasan_
└───────────────────────┘`;
const botInfo = `\n📱 _Pesan ini dikirim melalui BOT_
💡 *Tips*: Reply pesan ini dan ketik balasan Anda untuk mengirim pesan kembali`;

formattedMessage += botInfo;

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

        if (text.startsWith('!ig ')) {
            const url = text.slice(4).trim();
            await handleInstagramCommand(sock, senderId, url);
            return;
        }

        // Add to command handler
        if (text.startsWith('!suit') || text === '!rps') {
            await handleRPSGame(sock, senderId, text);
            return;
        }

        if (text.startsWith('!tt ')) {
            const url = text.slice(4).trim();
            await handleTiktokCommand(sock, senderId, url);
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