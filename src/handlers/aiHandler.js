// handlers/aiHandler.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function handleAIQuery(sock, senderId, message, retryCount = 0) {
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

    try {
        // Message validation
        const cleanMessage = String(message || '').trim();
        if (!cleanMessage) {
            await sendSafeMessage('❌ Please provide a valid question or prompt');
            return;
        }

        await sendSafeMessage('🤖 Processing your request...');

        // AI processing
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: cleanMessage }] }]
        });

        if (result?.response?.text) {
            await sendSafeMessage(`🤖 *AI Response:*\n\n${result.response.text()}`);
        }

    } catch (error) {
        console.error('AI Handler Error:', error);
        if (error.message?.includes('429') && retryCount < 3) {
            await new Promise(r => setTimeout(r, (retryCount + 1) * 2000));
            return handleAIQuery(sock, senderId, message, retryCount + 1);
        }
        await sendSafeMessage('❌ Error processing request');
    }
}

module.exports = { handleAIQuery };