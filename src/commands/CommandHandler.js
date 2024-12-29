const commands = require('./commandRegistry');

class CommandHandler {
    async executeCommand(sock, senderId, messageType, text, message) {
        const command = this.parseCommand(text);
        if (!command) return;

        const handler = commands[command.name];
        if (handler) {
            // Pass full message object for sticker command
            if (command.name === 'sticker' || command.name === 's') {
                console.log('Sticker command detected, passing message:', {
                    hasMessage: !!message,
                    messageType,
                    command: command.name
                });
                await handler(sock, message, senderId, messageType);
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