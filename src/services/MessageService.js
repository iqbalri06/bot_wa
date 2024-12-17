const QAHandler = require('../handlers/qaHandler');
const { handleRPSGame } = require('../games/rpsGame');
const { handleReply } = require('../handlers/replyHandler');

class MessageService {
    constructor() {
        this.qaHandler = new QAHandler();
        this.qaHandler.loadQAFromCSV('qa_database.csv');
    }

    async processMessage(sock, senderId, messageType, text, message) {
        // Check for reply first
        const quotedMsg = message.message?.[messageType]?.contextInfo?.stanzaId;
        if (quotedMsg) {
            await handleReply(sock, message, senderId);
            return;
        }

        // Then check game inputs
        if (['batu', 'gunting', 'kertas'].includes(text.toLowerCase())) {
            await handleRPSGame(sock, senderId, text);
            return;
        }

        // Finally check QA if no other handlers matched
        const answer = this.qaHandler.findAnswer(text);
        if (answer && answer !== 'Maaf, saya tidak menemukan jawaban untuk pertanyaan tersebut.') {
            await sock.sendMessage(senderId, { text: answer });
            return;
        }
    }
}

module.exports = MessageService;