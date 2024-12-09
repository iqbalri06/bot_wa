const config = require('../config/config');

// menus/welcomeMenu.js
const welcomeMenu = {
    'hai': `👋 Halo! Selamat datang di ${config.botName}!\n\nSaya adalah bot yang akan membantu kamu mengirim pesan secara anonim. Ketik "menu" untuk melihat daftar perintah.`,
    'hello': `👋 Halo! Selamat datang di ${config.botName}!\n\nSaya adalah bot yang akan membantu kamu mengirim pesan secara anonim. Ketik "menu" untuk melihat daftar perintah.`,
    'start': `🚀 ${config.botName} siap membantu!\n\nKetik "menu" untuk melihat daftar perintah yang tersedia.`
};

module.exports = welcomeMenu;