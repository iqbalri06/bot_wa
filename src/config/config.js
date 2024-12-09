module.exports = {
    botName: 'Iqbot Prime',
    owner: ['6281291544061@s.whatsapp.net'],
    prefix: '!',
    botInfo: {
        name: 'Iqbot Prime',
        version: '1.0.0',
        author: 'Iqbal Roudatul',
        description: 'Bot WhatsApp serba guna.'
    },
    session: {
        path: 'auth_info_baileys'
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