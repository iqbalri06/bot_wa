// handlers/aiHandler.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Store conversation history with 10 message limit per user
const conversationHistory = new Map();
const MAX_HISTORY = 10;

// Clean old conversations every 6 hours
setInterval(() => {
    conversationHistory.clear();
}, 6 * 60 * 60 * 1000);

async function handleAIQuery(sock, senderId, message, retryCount = 0, messageKey = null) {
    // Enhanced message key validation
    const isValidMessageKey = messageKey && 
        typeof messageKey === 'object' && 
        messageKey.id && 
        messageKey.remoteJid;

    if (!isValidMessageKey) {
        console.error('Invalid message key:', {
            received: messageKey,
            type: typeof messageKey,
            hasId: messageKey?.id,
            hasRemoteJid: messageKey?.remoteJid
        });
        
        // Fallback behavior for invalid message key
        if (sock?.sendMessage && senderId) {
            await sock.sendMessage(senderId, {
                text: '❌ System Error: Invalid message format. Please try again.',
                linkPreview: false
            });
        }
        return;
    }

    if (!sock?.sendMessage || !senderId) {
        console.error('Invalid sock or senderId in handleAIQuery');
        return;
    }

    const sendSafeMessage = async (content) => {
        try {
            await sock.sendMessage(senderId, {
                text: content,
                linkPreview: false
            });
        } catch (err) {
            console.error('AI send message error:', err);
        }
    };

    const sendReaction = async (emoji) => {
        try {
            await sock.sendMessage(messageKey.remoteJid, {
                react: {
                    text: emoji,
                    key: {
                        id: messageKey.id,
                        remoteJid: messageKey.remoteJid,
                        fromMe: messageKey.fromMe,
                        participant: messageKey.participant
                    }
                }
            });
        } catch (err) {
            console.error('Reaction error:', { error: err, messageKey });
        }
    };

    try {
        console.log('Starting AI query with key:', messageKey);
        await sendReaction('🤖');

        // Message validation
        const cleanMessage = String(message || '').trim();
        if (!cleanMessage) {
            await sendReaction('');
            await sendSafeMessage('❌ Please provide a valid question or prompt');
            return;
        }

        // Get or initialize conversation history
        if (!conversationHistory.has(senderId)) {
            conversationHistory.set(senderId, []);
        }
        const history = conversationHistory.get(senderId);

        // Build conversation with history
        const conversation = history.concat([
            { role: "user", parts: [{ text: cleanMessage }] }
        ]);

        // AI processing with context
        const result = await model.generateContent({
            contents: conversation
        });

        if (result?.response?.text) {
            const response = result.response.text();
            await sendSafeMessage(response);
            
            // Update history
            history.push(
                { role: "user", parts: [{ text: cleanMessage }] },
                { role: "model", parts: [{ text: response }] }
            );
            
            // Keep only recent messages
            while (history.length > MAX_HISTORY) {
                history.shift();
            }

            // Remove reaction after success
            await sendReaction('');
        }

    } catch (error) {
        // Structured error logging
        const errorContext = {
            error: error.message,
            messageKey,
            senderId,
            retryCount
        };
        console.error('AI Handler Error Details:', errorContext);

        // Handle rate limiting errors
        if (error.message?.includes('429') && retryCount < 3) {
            console.log(`Rate limit hit, attempting retry ${retryCount + 1}/3`);
            await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
            return handleAIQuery(sock, senderId, message, retryCount + 1);
        }

        // Handle invalid message key
        if (!messageKey || messageKey === 'null') {
            console.error('Invalid message key received');
            await sendSafeMessage('❌ Invalid message format');
            return;
        }

        // Clear any pending reactions
        await sendReaction('');

        // Send appropriate error message to user
        const errorMessage = error.code === 'NETWORK_ERROR' 
            ? '❌ Network error occurred. Please try again.'
            : '❌ Error processing request. Please try again later.';
        
        await sendSafeMessage(errorMessage);
    }
}

module.exports = { handleAIQuery };