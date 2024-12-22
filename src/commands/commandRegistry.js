const { handleAIQuery } = require('../handlers/aiHandler');
const { handleInstagramCommand } = require('../handlers/instagramHandler');
const { handleTiktokCommand } = require('../handlers/tiktokHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleSticker } = require('../handlers/stikerHandler');
const { handleSendCommand } = require('../handlers/sendHandler');
const { getMainMenu } = require('../menus/mainMenu');
const gameMenu = require('../menus/gameMenu');
const instagramMenu = require('../menus/instagramMenu');
const { handleRemoveBackground } = require('../handlers/bgHandler');
const tempMailHandler = require('../handlers/tempMailHandler');

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
    'rmbg': (sock, senderId, params, messageType, message) => 
        handleRemoveBackground(sock, senderId, messageType, message),
    'instagram': async (sock, senderId) => {
        await sock.sendMessage(senderId, { text: instagramMenu });
    },
    'tempmail': async (sock, senderId) => {
        const response = await tempMailHandler.generateEmail(senderId);
        await sock.sendMessage(senderId, { text: response });
    },
    'cekmail': async (sock, senderId) => {
        const response = await tempMailHandler.checkMessages(senderId);
        await sock.sendMessage(senderId, { text: response });
    },
    'readmail': async (sock, senderId, params) => {
        // Handle both string and array params
        const paramString = Array.isArray(params) ? params.join(' ') : String(params);
        const messageId = paramString.match(/\d+/)?.[0];
        
        if (!messageId) {
            await sock.sendMessage(senderId, { text: '❌ Masukkan ID pesan yang ingin dibaca' });
            return;
        }
        const response = await tempMailHandler.readMessage(senderId, messageId);
        await sock.sendMessage(senderId, { text: response });
    },

};

module.exports = commands;