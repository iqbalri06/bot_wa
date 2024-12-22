const config = require('../config/config');

async function getMainMenu() {
    try {
        return {
            text: `✧ *${config.botName}* ✧

=== MENU UTAMA ===

*FITUR UTAMA*
1. 🤖 Asisten AI
2. 📨 Pesan Anonim
3. ℹ️ Info Bot
4. 🎮 Games Seru

*ALAT MEDIA*
5. 📱 Unduh Video TikTok
6. 📸 Unduh Video/Foto Instagram
7. 🎯 Pembuat Stiker
8. 🎨 Hapus Background
9. 📧 Email Sementara

*CARA PENGGUNAAN*
• Ketik angka (1-9) untuk memilih
• Contoh: Kirim "1" untuk AI
• Butuh bantuan? Ketik "menu"`
        };
    } catch (error) {
        console.error('Error generating main menu:', error);
        return { text: '❌ Terjadi kesalahan dalam menampilkan menu' };
    }
}

module.exports = { getMainMenu };