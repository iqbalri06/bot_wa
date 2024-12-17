
function getMessageContent(message) {
    if (!message.message) return { messageType: '', content: '' };
    
    const messageType = Object.keys(message.message)[0];
    let content = '';

    switch(messageType) {
        case 'imageMessage':
            content = message.message.imageMessage.caption || '';
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

module.exports = {
    getMessageContent
};