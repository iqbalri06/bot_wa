const commands = require('./commandRegistry');

class CommandHandler {
    async executeCommand(sock, senderId, messageType, text, message) {
        const command = this.parseCommand(text);
        if (!command) return;

        const handler = commands[command.name];
        if (handler) {
            // Special handling for sticker commands
            if (command.name === 'sticker' || command.name === 's') {
                await handler(sock, message, senderId);
            } else {
                await handler(sock, senderId, command.params, messageType, message);
            }
        }
    }

    parseCommand(text) {
        if (!text.startsWith('!')) return null;

        const parts = text.slice(1).split(' ');
        return {
            name: parts[0],
            params: parts.slice(1).join(' ')
        };
    }
}

module.exports = CommandHandler;