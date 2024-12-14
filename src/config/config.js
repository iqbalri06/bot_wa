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
        path: 'auth_info_baileys'
    },
    gemini: {
        apiKey: 'AIzaSyCTiweyGV7t7pVeJ1aQAkzUucm2AiB-xLs',
        model: 'gemini-1.5-flash'
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