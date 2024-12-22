// textResponses.js
const menus = require('../menus');

const responses = {
    // Welcome responses
    'hai': menus.welcome.hai,
    'hello': menus.welcome.hello, 
    'start': menus.welcome.start,

    // Main menu
    'menu': menus.main,

    // Numbered menus
    '1': menus.ai,
    '2': menus.anonymous,
    '3': menus.about,
    '4': menus.game,
    '5': menus.tiktok,
    '6': menus.instagram,
    '7': menus.stiker,
    '8': menus.bg,

    // Error responses
    'invalid_format': '❌ Format pesan tidak valid!\n\nGunakan format:\n!kirim <nomor> <pesan>',
    'send_success': '✅ Pesan berhasil dikirim!',
    'send_failed': '❌ Gagal mengirim pesan! Silakan coba lagi.',
    'reply_failed': '❌ Gagal mengirim balasan! Silakan coba lagi.'
};

module.exports = { responses };