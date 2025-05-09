module.exports = {
    botName: 'TechBalion',
    owner: ['6281291544061@s.whatsapp.net'],
    prefix: '!',
    botInfo: {
        name: 'TechBalion',
        version: '2.0.0',
        author: 'Iqbal Roudatul',
        description: 'Bot WhatsApp serba guna.'
    },
    session: {
        path: 'auth_info_baileys',
        maxSessions: 1 // Limit to single session to prevent conflicts
    },
    gemini: {
        apiKey: 'AIzaSyAHoDgE_kChH9E86WIvtG_yMkWAuFT3qFU',
        model: 'gemini-2.0-flash-exp'
    },
    maintenance: {
        enabled: false,
        message: 'Maaf, bot sedang dalam perbaikan. Harap coba lagi nanti. Untuk info lebih lanjut, hubungi developer.',
        allowedUsers: ['6281291544061@s.whatsapp.net', '6285155349970@s.whatsapp.net'] // Same as owner by default
    },
    commands: {
        start: ['hi', 'halo', 'mulai'],
        public: ['menu', 'bantuan', 'tentang', 'ping'],
        admin: ['siaran', 'statistik'],
        game: {
            aliases: ['game', 'permainan'],
            description: 'Menampilkan menu permainan'
        },
        suit: {
            aliases: ['suit', 'rps'],
            description: 'Main suit kertas gunting batu'
        }
    }
};