const QAHandler = require('../handlers/qaHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleReply } = require('../handlers/replyHandler');

class MessageService {
    constructor() {
        this.qaHandler = new QAHandler();
        this.qaHandler.loadQAFromCSV('qa_database.csv');
    }

    async processMessage(sock, senderId, messageType, text, message) {
        try {
            if (!sock?.sendMessage || !senderId) {
                console.error('Invalid sock or senderId');
                return;
            }

            // Handle quoted messages first
            if (message?.message?.[messageType]?.contextInfo?.quotedMessage) {
                await handleReply(sock, message, senderId);
                return;
            }

            // Handle game inputs
            const gameInput = String(text || '').toLowerCase().trim();
            if (['batu', 'gunting', 'kertas'].includes(gameInput)) {
                await handleRPSGame(sock, senderId, gameInput);
                return;
            }

            // Handle QA with AI fallback
            const answer = await this.qaHandler.findAnswer(text, sock, senderId);
            if (answer) {
                await sock.sendMessage(senderId, {
                    text: answer,
                    linkPreview: false
                });
            }

        } catch (error) {
            console.error('Process message error:', error);
            throw error;
        }
    }
}

module.exports = MessageService;