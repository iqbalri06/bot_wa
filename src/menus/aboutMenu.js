// menus/aboutMenu.js
const config = require('../config/config');

const formatPhoneNumber = (number) => {
    return number.replace('@s.whatsapp.net', '').replace('62', '+62 ');
};

const aboutMenu = `
╔══✪〘 *${config.botName}* 〙✪══
║
║  ◈━━━━━━━━━━━━━━◈
║  🤖 *INFORMASI BOT*
║  ◈━━━━━━━━━━━━━━◈
║  ✧ Nama      : ${config.botInfo.name}
║  ✧ Versi     : ${config.botInfo.version}
║  ✧ Developer : ${config.botInfo.author}
║
║  ◈━━━━━━━━━━━━━━◈
║  📱 *KONTAK DEVELOPER*
║  ◈━━━━━━━━━━━━━━◈
${config.owner.map(owner => `║  ❯ wa.me/${formatPhoneNumber(owner)}`).join('\n')}
║
║  ◈━━━━━━━━━━━━━━◈
║  💫 *DESKRIPSI*
║  ◈━━━━━━━━━━━━━━◈
║  ${config.botInfo.description}
║
╚══════════════════

✨ *Catatan:* _Gunakan bot dengan bijak_
📝 _dan hindari spam!_ `;

module.exports = aboutMenu;