
const { DisconnectReason } = require('@whiskeysockets/baileys');

class ConnectionHandler {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 5;
        this.baseDelay = 5000; // 5 seconds
    }

    async handleConnectionUpdate(update, startSock) {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to:', lastDisconnect?.error);
            
            if (shouldReconnect && this.retryCount < this.maxRetries) {
                const delay = this.baseDelay * Math.pow(2, this.retryCount);
                this.retryCount++;
                console.log(`Reconnecting in ${delay/1000} seconds... (Attempt ${this.retryCount}/${this.maxRetries})`);
                
                setTimeout(async () => {
                    console.log('Reconnecting...');
                    await startSock();
                }, delay);
            }
        }

        if (connection === 'open') {
            console.log('Connected successfully!');
            this.retryCount = 0; // Reset retry count on successful connection
        }
    }
}

module.exports = { ConnectionHandler };