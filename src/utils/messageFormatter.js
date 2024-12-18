
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

function formatReplyMessage(timestamp, text, originalMessage) {
    return `┌─────「 ✉️ *BALASAN* 」─────┐\n\n` +
           `⏱️ *Waktu* : ${timestamp}\n\n` +
           `┌──「 💬 Membalas Pesan 」──\n❝\n${originalMessage}\n❞\n\n` +
           `┌──「 💬 Balasan 」──\n❝\n${text}\n❞\n\n` +
           `✨ _Pesan Balasan_\n` +
           `└─────────────────────┘`;
}

module.exports = {
    formatNewMessage,
    formatReplyMessage
};