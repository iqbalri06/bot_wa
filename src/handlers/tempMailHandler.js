const axios = require('axios');

class TempMailHandler {
    constructor() {
        this.userEmails = new Map();
    }

    async generateEmail(senderId) {
        try {
            const response = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
            const email = response.data[0];
            this.userEmails.set(senderId, email);
            return `📧 Email sementara anda:\n${email}`;
        } catch (error) {
            console.error('Error generating email:', error);
            return '❌ Gagal membuat email sementara';
        }
    }

    async checkMessages(senderId) {
        const email = this.userEmails.get(senderId);
        if (!email) return '❌ Anda belum memiliki email sementara. Gunakan !tempmail untuk mendapatkan email.';

        try {
            const [login, domain] = email.split('@');
            const response = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
            const messages = response.data;

            if (messages.length === 0) return '📭 Belum ada pesan masuk';

            let formattedResponse = `📧 *Email Box:* ${email}\n`;
            formattedResponse += `📨 ${messages.length} messages\n\n`;

            formattedResponse += messages.map(msg => 
                `📩 *Message ID:* ${msg.id}\n` +
                `📤 From: ${msg.from}\n` +
                `📑 ${msg.subject}\n` +
                `⏰ ${msg.date}\n` +
                `▶️ ketik !readmail ${msg.id} untuk membaca pesan\n`
            ).join('\n\n');

            return formattedResponse;
        } catch (error) {
            console.error('Error checking messages:', error);
            return '❌ Gagal mengecek pesan';
        }
    }

    async readMessage(senderId, messageId) {
        const email = this.userEmails.get(senderId);
        if (!email) return '❌ Anda belum memiliki email sementara';

        try {
            const [login, domain] = email.split('@');
            const response = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`);

            // Log the raw response to debug
            console.log('readMessage raw data:', JSON.stringify(response.data, null, 2));

            let msgData = response.data;
            if (Array.isArray(msgData) && msgData.length > 0) {
                msgData = msgData[0];
            }
            const message = msgData;

            if (!message) {
                return '❌ Pesan tidak ditemukan';
            }

            // Simplified message formatting
            let rawContent = message.textBody || message.body || message.htmlBody || '';
            let cleanContent = rawContent.replace(/<[^>]*>/g, '').trim();

            let formattedMessage = `📧 *Email Message*\n\n`;
            formattedMessage += `📤 From: ${message.from}\n`;
            formattedMessage += `📑 Subject: ${message.subject}\n`;
            formattedMessage += `⏰ Date: ${message.date}\n`;
            formattedMessage += `\n💌 Message:\n${cleanContent}\n`;

            if (message.attachments?.length > 0) {
                formattedMessage += `\n📎 Attachments: ${message.attachments.length} files`;
            }

            return formattedMessage;
        } catch (error) {
            console.error('Error reading message:', error);
            return '❌ Gagal membaca pesan. ID tidak valid atau pesan sudah dihapus.';
        }
    }
}

const tempMailHandler = new TempMailHandler();

module.exports = tempMailHandler;