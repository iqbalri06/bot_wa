module.exports = {
    botName: 'Wikfess Bot',
    owner: ['6281291544061@s.whatsapp.net'],
    prefix: '!',
    botInfo: {
        name: 'Wikfess Bot',
        version: '1.0.0',
        author: 'Iqbal Roudatul',
        description: 'WhatsApp Bot for Anonymous Message'
    },
    session: {
        path: 'auth_info_baileys'
    },
    commands: {
        start: ['hi', 'hello', 'start'],
        public: ['menu', 'help', 'about', 'ping'],
        admin: ['broadcast', 'stats'],
        game: {
            aliases: ['game', 'games'],
            description: 'Menampilkan menu game'
        },
        suit: {
            aliases: ['suit', 'rps'],
            description: 'Main suit kertas gunting batu'
        }
    }
};