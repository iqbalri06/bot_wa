const CommandHandler = require('../commands/CommandHandler');
const MessageService = require('../services/MessageService');
const { getMessageContent } = require('../utils/messageUtils');
const { handleError } = require('../utils/errorHandler');

class MessageHandler {
    constructor() {
        this.commandHandler = new CommandHandler();
        this.messageService = new MessageService();
        this.responseTimeout = new Map();
        this.TIMEOUT_PERIOD = 5000;
    }

    async handle(sock, message) {
        try {
            const { messageType, content: text } = getMessageContent(message);
            const senderId = message.key.remoteJid;

            if (!text || !this.checkRateLimit(senderId)) return;

            const lowercaseText = text.toLowerCase().trim();
            
            // Handle commands
            if (lowercaseText.startsWith('!')) {
                await this.commandHandler.executeCommand(sock, senderId, messageType, text, message);
                return;
            }

            // Handle non-command messages
            await this.messageService.processMessage(sock, senderId, messageType, text, message);

        } catch (error) {
            await handleError(sock, message.key.remoteJid, error);
        }
    }

    checkRateLimit(senderId) {
        const now = Date.now();
        if (now - (this.responseTimeout.get(senderId) || 0) < this.TIMEOUT_PERIOD) {
            return false;
        }
        this.responseTimeout.set(senderId, now);
        return true;
    }
}

// Instead of exporting the instance, export the handle method directly
const messageHandler = new MessageHandler();
const handleMessage = messageHandler.handle.bind(messageHandler);

module.exports = { handleMessage };