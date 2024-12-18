const { handleAIQuery } = require('../handlers/aiHandler');
const { handleInstagramCommand } = require('../handlers/instagramHandler');
const { handleTiktokCommand } = require('../handlers/tiktokHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleSticker } = require('../handlers/stikerHandler');
const { handleSendCommand } = require('../handlers/sendHandler');
const { getMainMenu } = require('../menus/mainMenu');
const gameMenu = require('../menus/gameMenu');
const instagramMenu = require('../menus/instagramMenu');
const { responses } = require('../commands/textResponses');
const menus = require('../menus');

const commands = {
    'ai': (sock, senderId, params) => handleAIQuery(sock, senderId, params),
    'ig': (sock, senderId, params) => handleInstagramCommand(sock, senderId, params),
    'tt': (sock, senderId, params) => handleTiktokCommand(sock, senderId, params),
    'suit': handleRPSGame,
    'rps': handleRPSGame,
    'sticker': handleSticker,
    'kirim': handleSendCommand,
    'menu': async (sock, senderId) => {
        const menu = await getMainMenu();
        await sock.sendMessage(senderId, menu);
    },
    'game': async (sock, senderId) => {
        await sock.sendMessage(senderId, { text: gameMenu });
    },
    'instagram': async (sock, senderId) => {
        await sock.sendMessage(senderId, { text: instagramMenu });
    },

};

module.exports = commands;