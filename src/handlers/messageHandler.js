const CommandHandler = require('../commands/CommandHandler');
const MessageService = require('../services/MessageService');
const { getMessageContent } = require('../utils/messageUtils');
const { handleError } = require('../utils/errorHandler');
const QAHandler = require('./qaHandler');

class MessageHandler {
    constructor() {
        this.commandHandler = new CommandHandler();
        this.messageService = new MessageService();
        this.responseTimeout = new Map();
        this.TIMEOUT_PERIOD = 2000;
        this.handle = this.handle.bind(this); // Bind handle method to class instance
        this.qaHandler = new QAHandler();
        this.qaHandler.loadQAFromCSV('qa_database.csv');
    }

    checkRateLimit(senderId) {
        const now = Date.now();
        if (this.responseTimeout.has(senderId)) {
            const lastTime = this.responseTimeout.get(senderId);
            if (now - lastTime < this.TIMEOUT_PERIOD) {
                return false;
            }
        }
        this.responseTimeout.set(senderId, now);
        return true;
    }

    async handle(sock, message) {
        try {
            // Strengthen validation
            if (!sock?.sendMessage || !message?.key?.remoteJid) {
                console.error('Invalid message/socket:', {
                    hasSocket: !!sock?.sendMessage,
                    hasJid: !!message?.key?.remoteJid
                });
                return;
            }

            const { messageType, content } = getMessageContent(message) || {};
            const senderId = message.key.remoteJid;

            // Enhanced content validation
            const validContent = typeof content === 'string' ? 
                content : 
                typeof content === 'object' ? 
                    JSON.stringify(content) : 
                    String(content || '');

            if (!validContent) {
                console.log('Empty or invalid message content');
                return;
            }

            if (!this.checkRateLimit(senderId)) return;

            // Process message with validated content
            const text = validContent.toString().trim();
            
            // Handle plain "menu" text
            if (text === 'menu' || text === '!menu') {
                const { getMainMenu } = require('../menus/mainMenu');
                const menu = await getMainMenu();
                await sock.sendMessage(senderId, { text: menu.text });
                return;
            }

            // Handle menu selections
            if (/^[1-7]$/.test(text)) {
                await this.handleMenuSelection(sock, senderId, parseInt(text));
                return;
            }

            // Handle other commands
            if (text.startsWith('!')) {
                await this.commandHandler.executeCommand(sock, senderId, messageType, text, message);
                return;
            }

            // Remove QA handling here and only process through MessageService
            await this.messageService.processMessage(sock, senderId, messageType, text, message);

        } catch (error) {
            console.error('Message handling error:', error);
            if (sock?.sendMessage && message?.key?.remoteJid) {
                await handleError(sock, message.key.remoteJid, error);
            }
        }
    }

    async sendResponse(sock, senderId, content) {
        if (!senderId || !content) {
            console.error('Invalid senderId or content');
            return false;
        }

        try {
            // Ensure proper message structure
            const messageContent = typeof content === 'string' ? 
                { text: content, linkPreview: false } : 
                { ...content, linkPreview: false };

            const sent = await sock.sendMessage(senderId, messageContent);
            return !!sent;
        } catch (error) {
            console.error('Send response error:', error);
            return false;
        }
    }

    async handleMenuSelection(sock, senderId, selection) {
        try {
            switch (selection) {
                case 1: // AI Assistant
                    await this.sendResponse(sock, senderId, { text: require('../menus/instagramMenu')});
                    break;
                case 2: // Anonymous Message
                    await this.sendResponse(sock, senderId, {text: require('../menus/anonymousMenu')});
                    break;
                case 3: // Bot Info
                    const { getMainMenu } = require('../menus/aboutMenu');
                    const menu = await getMainMenu();
                    await this.sendResponse(sock, senderId, menu);
                    break;
                case 4: // Fun Games
                    await this.sendResponse(sock, senderId, { text: require('../menus/gameMenu') });
                    break;
                case 5: // TikTok
                    await this.sendResponse(sock, senderId, { text: require('../menus/tiktokMenu') });
                    break;
                case 6: // Instagram
                    await this.sendResponse(sock, senderId, { text: require('../menus/instagramMenu') });
                    break;
                case 7: // Sticker
                    await this.sendResponse(sock, senderId, {text: require('../menus/stikerMenu')});
                    break;
                default:
                    await this.sendResponse(sock, senderId, { 
                        text: '❌ Pilihan tidak valid. Silakan pilih 1-7' 
                    });
            }
        } catch (error) {
            await handleError(sock, senderId, error);
        }
    }
}

// Create a single instance
const messageHandler = new MessageHandler();

// Export the bound handle method
module.exports = {
    handleMessage: (sock, message) => messageHandler.handle(sock, message)
};