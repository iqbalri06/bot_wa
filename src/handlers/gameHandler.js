const gameMenuText = {
    menu: async (sock, senderId) => {
        const menuMessage = `╔═══《 🎮 *GAME MENU* 🎮 》═══╗

📌 *List Game:*

1️⃣ *Suit (RPS)*
   • Ketik: !suit
   • Main suit kertas gunting batu
   • Kumpulkan skor tertinggi!

2️⃣ *Coming Soon...*

╚════《 ✨ *Have Fun!* ✨ 》════╝

_Ketik sesuai perintah untuk bermain_`;

        await sock.sendMessage(senderId, { text: menuMessage });
    }
};

module.exports = {
    gameMenuText
};