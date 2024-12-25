function getMessageContent(message) {
    if (!message.message) return { messageType: '', content: '' };
    
    const messageType = Object.keys(message.message)[0];
    let content = '';

    switch(messageType) {
        case 'imageMessage':
            content = message.message.imageMessage.caption || '[Image]';
            break;
        case 'videoMessage':
            content = message.message.videoMessage.caption || '[Video]';
            break;
        case 'audioMessage':
            content = '[Audio]';
            break;
        case 'stickerMessage':
            content = '[Sticker]';
            break;
        case 'conversation':
            content = message.message.conversation || '';
            break;
        case 'extendedTextMessage':
            content = message.message.extendedTextMessage.text || '';
            break;
        default:
            content = '';
    }

    return { messageType, content };
}

// Add new helper function
const getQuotedMessage = (message) => {
    try {
        // Add null check for message
        if (!message?.message) {
            return null;
        }

        // Safely get message keys
        const messageTypes = Object.keys(message.message || {});
        if (!messageTypes.length) {
            return null;
        }

        // Get quoted message safely
        const quotedMessage = messageTypes
            .map(type => message.message[type]?.contextInfo?.quotedMessage)
            .find(quoted => quoted != null);

        return quotedMessage || null;
    } catch (error) {
        console.error('Error getting quoted message:', error);
        return null;
    }
};

module.exports = {
    getMessageContent,
    getQuotedMessage
};