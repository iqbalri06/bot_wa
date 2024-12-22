function formatNewMessage(timestamp, messageText) {
    return [
        `📩 *Pesan Masuk*`,
        `${timestamp} • Anonim`,
        `💬 Pesan:\n➥ ${messageText}\n`,
        `📝 *Panduan Membalas:*`,
        `1️⃣ Tekan lama pesan ini`,
        `2️⃣ Pilih "Reply"`,
        `3️⃣ Ketik balasan kamu`,
        `4️⃣ Kirim`
    ].join('\n');
}

function formatReplyMessage(timestamp, text, originalMessage) {
    return [
        `✉️ *Balasan Terkirim*`,
        `${timestamp}`,
        `▢ Pesan: ${originalMessage}`,
        `▣ Balas: ${text}\n`,
        `✨ Balasan sudah diteruskan ke pengirim`
    ].join('\n');
}

module.exports = {
    formatNewMessage,
    formatReplyMessage
};