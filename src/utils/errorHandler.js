
/**
 * Handles errors in a consistent way across the application
 */
async function handleError(sock, senderId, error) {
    console.error('Bot Error:', error);
    
    try {
        // Send error message to user
        await sock.sendMessage(senderId, { 
            text: '❌ Terjadi kesalahan pada sistem\n\n' +
                  '_Silakan coba beberapa saat lagi_'
        });
    } catch (sendError) {
        console.error('Error sending error message:', sendError);
    }
}

module.exports = {
    handleError
};