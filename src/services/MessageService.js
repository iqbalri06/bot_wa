const QAHandler = require('../handlers/qaHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleReply } = require('../handlers/replyHandler');
const { getQuotedMessage } = require('../utils/messageUtils');

class MessageService {
    constructor() {
        this.qaHandler = new QAHandler();
        this.qaHandler.loadQAFromCSV('qa_database.csv');
    }

    async processMessage(sock, senderId, messageType, text, standardizedMessage) {
        try {
            // Initial validation
            if (!standardizedMessage?.messageInfo) {
                console.error('Invalid message info:', standardizedMessage);
                return;
            }

            const { messageInfo } = standardizedMessage;
            console.log('Processing message:', { type: messageType, hasReply: !!messageInfo.rawMessage });

            // Check if message is a reply by looking for contextInfo
            const isReply = messageInfo.rawMessage && 
                (messageInfo.rawMessage.extendedTextMessage?.contextInfo?.stanzaId ||
                 Object.values(messageInfo.rawMessage).some(msg => msg?.contextInfo?.stanzaId));

            if (isReply) {
                console.log('Handling reply message...');
                await handleReply(sock, {
                    key: messageInfo.key,
                    message: messageInfo.rawMessage
                }, senderId);
                return;
            }

            // Only proceed to QA/AI if not a reply
            console.log('No reply found, proceeding to QA/AI...');
            const answer = await this.qaHandler.findAnswer(text, sock, senderId, messageInfo);
            if (answer) {
                await sock.sendMessage(senderId, {
                    text: answer,
                    linkPreview: false
                });
            }

        } catch (error) {
            console.error('Process message error:', {
                error,
                messageType,
                messageInfo: standardizedMessage?.messageInfo
            });
            throw error;
        }
    }
}

module.exports = MessageService;