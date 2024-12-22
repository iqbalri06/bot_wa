const commands = require('./commandRegistry');

class CommandHandler {
    async executeCommand(sock, senderId, messageType, text, message) {
        if (!text.startsWith('!')) return;

        // Split command and parameters more cleanly
        const args = text.trim().split(/\s+/);
        const cmdName = args[0].substring(1); // Remove '!' from command
        const params = args.slice(1).join(' '); // Join remaining args back into string

        const handler = commands[cmdName];
        if (handler) {
            await handler(sock, senderId, params, messageType, message);
        }
    }

    // Remove parseCommand method as it's no longer needed
}

module.exports = CommandHandler;