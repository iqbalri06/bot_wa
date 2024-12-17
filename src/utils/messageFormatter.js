
function formatNewMessage(timestamp, messageText) {
    return [
        `┌───「 📨 *PESAN BARU* 」──┐\n`,
        `⏱️ *Waktu* : ${timestamp}`,
        `👤 *Dari* : Anonim\n`,
        `┌──「 💭 Pesan 」──\n❝\n${messageText}\n❞\n`,
        `_↪️ Gunakan fitur Balas untuk mengirim pesan_`,
        `└─────────────────────┘`
    ].join('\n');
}

function formatReplyMessage(timestamp, text) {
    return `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
           `⏱️ *Waktu* : ${timestamp}\n\n` +
           `┌──「 💬 Pesan 」──\n❝\n${text}\n❞\n\n` +
           `✨ _Pesan Balasan_\n` +
           `└─────────────────────┘`;
}

module.exports = {
    formatNewMessage,
    formatReplyMessage
};