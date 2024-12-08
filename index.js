const { connectToWhatsApp } = require('./src/utils/connect');

async function startBot() {
    console.log('Starting WhatsApp Bot...');
    connectToWhatsApp();
}

startBot();