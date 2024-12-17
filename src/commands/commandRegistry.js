const { handleAIQuery } = require('../handlers/aiHandler');
const { handleInstagramCommand } = require('../handlers/instagramHandler');
const { handleTiktokCommand } = require('../handlers/tiktokHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleSticker } = require('../handlers/stikerHandler');
const { handleSendCommand } = require('../handlers/sendHandler');

const commands = {
    'ai': (sock, senderId, params) => handleAIQuery(sock, senderId, params),
    'ig': (sock, senderId, params) => handleInstagramCommand(sock, senderId, params),
    'tt': (sock, senderId, params) => handleTiktokCommand(sock, senderId, params),
    'suit': handleRPSGame,
    'rps': handleRPSGame,
    'sticker': handleSticker,
    'kirim': handleSendCommand
};

module.exports = commands;