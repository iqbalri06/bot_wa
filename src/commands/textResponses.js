const config = require('../config/config');



const responses = {
    // Pesan Pembuka
    'hi': '👋 Halo! Selamat datang di Wikfess Bot!\n\nSaya adalah bot yang akan membantu kamu mengirim pesan secara anonim. Ketik "menu" untuk melihat daftar perintah.',
    'hello': '👋 Halo! Selamat datang di Wikfess Bot!\n\nSaya adalah bot yang akan membantu kamu mengirim pesan secara anonim. Ketik "menu" untuk melihat daftar perintah.',
    'start': '🚀 Wikfess Bot siap membantu!\n\nKetik "menu" untuk melihat daftar perintah yang tersedia.',
    
    // Menu dan Bantuan
    'menu': `✨ *WIKFESS BOT* ✨

┏━━━『 MENU UTAMA 』━━━┓

1️⃣ *Kirim Pesan Anonim*
   Send anonymous message

2️⃣ *Bot Kejar ID*
   Auto click bot service

3️⃣ *Info Bot*
   About this bot
   
4️⃣ *Game Menu*
   Play fun games

┗━━━━━━━━━━━━━━━┛

_Ketik nomor (1-4) untuk memilih_`,

    '1': `┏━━━『 📨 PESAN ANONIM 』━━━┓

⌲ *Format Pesan*
• !kirim <nomor> <pesan>
• Ex: !kirim 628xxx Halo!

⌲ *Ketentuan*
• Nomor: 628xxx (no +)
• Max 200 karakter
• SFW content only

_Gunakan dengan bijak_ ✨

┗━━━━━━━━━━━━━━━┛`,

    '2': `🔥 *BOT KEJAR ID* 🔥\n
┏━━━━「 🤖 Info Bot 」━━━━┓
┃ • Nama: Bot Auto Click Kejar ID
┃ • Versi: 3.0.0
┃ • Creator: Iqbal Roudatul
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━「 🔗 Link 」━━━━┓
┃ Github: github.com/iqbalri06/bot_kejar_v.2.0
┗━━━━━━━━━━━━━━━━━━┛

📝 *Instalasi:*
\`\`\`
git clone https://github.com/iqbalri06/bot_kejar_v.2.0
cd bot_kejar_v.2.0
pip install --upgrade pip
pip install selenium colorama webdriver_manager requests cryptography
python run.py
\`\`\`

💫 _Kunjungi Github untuk panduan lengkap_`,

    'Bantuan': `✨ *PANDUAN BOT* ✨\n
┏━━━━「 📌 Aturan 」━━━━┓
┃ • Awali perintah dengan "!"
┃ • Format: 628xxx (no +)
┃ • Pesan wajib diisi
┃ • Tunggu konfirmasi bot
┗━━━━━━━━━━━━━━━━━━━┛

⛔ *DILARANG*
• Spam pesan
• Konten SARA
• Pelecehan
• Promosi/Iklan

💡 *Tips Penggunaan*
• Cek nomor tujuan
• Tunggu respon
• Jaga kesopanan`,

    // Tambahkan respons untuk perintah "tentang"
    '3': `ℹ️ *TENTANG ${config.botName}*\n
━━━━━━━━━━━━━━━━
🤖 *Nama Bot:* ${config.botInfo.name}
📱 *Versi:* ${config.botInfo.version}
👨‍💻 *Developer:* ${config.botInfo.author}
📝 *Deskripsi:* ${config.botInfo.description}

💡 *Fitur Utama:*
• Kirim pesan secara anonim
• Balasan diteruskan ke pengirim
• Support format pesan lengkap

📢 _Bot ini dibuat untuk memudahkan komunikasi anonim dengan aman dan nyaman_
━━━━━━━━━━━━━━━━`,

    '4': `╔═══《 🎮 *GAME MENU* 🎮 》═══╗

📌 *List Game:*

1️⃣ *Suit (RPS)*
   • Ketik: !suit
   • Main suit kertas gunting batu
   • Kumpulkan skor tertinggi!

2️⃣ *Coming Soon...*

╚════《 ✨ *Have Fun!* ✨ 》════╝

_Ketik sesuai perintah untuk bermain_`,

    // Status dan Respon
    'ping': '🏓 Pong!\nStatus: Online\n',
    'send_success': '✅ Pesan berhasil terkirim!\n\nKetik "menu" untuk mengirim pesan lain.',
    'send_failed': '❌ Gagal mengirim pesan!\n\nMohon cek nomor tujuan dan coba lagi.',
    'invalid_format': '⚠️ Format pesan salah!\n\nGunakan: !kirim <nomor> <pesan>\nContoh: !kirim 628123456789 Halo!',
    
    // Error Messages
    'error_limit': '⚠️ Anda telah mencapai batas pengiriman pesan harian.',
    'error_blocked': '❌ Nomor tujuan memblokir pesan masuk.',
    'error_invalid': '⚠️ Nomor tujuan tidak valid atau tidak terdaftar di WhatsApp.'
    
};

module.exports = { responses };