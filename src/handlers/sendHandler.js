const { responses } = require('../commands/textResponses');
const { formatNewMessage } = require('../utils/messageFormatter');

// Store chat data dengan Map global
const chatData = new Map();

async function handleSendCommand(sock, senderId, params) {
    const [number, ...messageArray] = params.split(' ');
    const messageText = messageArray.join(' ');

    if (!number || !messageText) {
        await sock.sendMessage(senderId, { text: responses.invalid_format });
        return;
    }

    const formattedNumber = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });

    try {
        // Kirim pesan ke nomor tujuan
        const sent = await sock.sendMessage(formattedNumber, {
            image: { url: './asset/img/banner_techbalion.png' },
            caption: formatNewMessage(timestamp, messageText)
        });
        
        // Simpan data chat dengan informasi lengkap
        chatData.set(sent.key.id, { 
            sender: senderId, 
            receiver: formattedNumber,
            message: messageText,
            timestamp: timestamp,
            isInitial: true // Menandai ini sebagai pesan awal
        });

        // Kirim notifikasi ke pengirim
        await sock.sendMessage(senderId, { 
            text: `✅ Pesan berhasil dikirim ke nomor ${number}\n\n` +
                  `📬 Isi Pesan:\n${messageText}\n\n` +
                  `_Bot by @TechBalion_`
        });

    } catch (err) {
        console.error('Error sending message:', err);
        await sock.sendMessage(senderId, { text: responses.send_failed });
    }
}

module.exports = {
    handleSendCommand,
    chatData
};