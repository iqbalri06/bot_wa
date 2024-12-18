/**
 * Handles errors in a consistent way across the application
 */
async function handleError(sock, senderId, error) {
    console.error('Bot Error:', error.message || error);
    
    if (!senderId) {
        console.error('No senderId provided for error message');
        return;
    }

    try {
        const sent = await sock.sendMessage(senderId, { 
            text: '❌ Terjadi kesalahan pada sistem\n\n' +
                  '_Silakan coba beberapa saat lagi_'
        });
        
        if (!sent) {
            throw new Error('Message failed to send');
        }
        
    } catch (sendError) {
        console.error('Error sending error message:', sendError.message || sendError);
    }
}

module.exports = {
    handleError
};