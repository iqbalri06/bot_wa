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
    environment: {
        current: process.env.NODE_ENV || 'production', // 'production' or 'development'
        productionSession: 'prod_auth_info_baileys',
        developmentSession: 'dev_auth_info_baileys'
    },
    session: {
        // Dynamic session path based on environment
        path: process.env.NODE_ENV === 'development' ? 
            'dev_auth_info_baileys' : 
            'prod_auth_info_baileys'
    },
    gemini: {
        apiKey: 'AIzaSyCTiweyGV7t7pVeJ1aQAkzUucm2AiB-xLs',
        model: 'gemini-1.5-flash'
    },
    maintenance: {
        enabled: false,
        forceMaintenanceOnDualLogin: true, // New setting
        message: "🛠️ *Bot sedang dalam maintenance*\n\nMohon maaf, bot sedang dalam perbaikan/update.\nSilakan coba beberapa saat lagi.\n\nTerimakasih atas pengertiannya! 🙏"
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