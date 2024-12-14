// handlers/aiHandler.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function handleAIQuery(sock, senderId, message, retryCount = 0) {
    // Validate query
    if (!message || message.trim() === '') {
        await sock.sendMessage(senderId, {
            text: '❌ Please provide a question or prompt after !ai'
        });
        return;
    }

    const startTime = Date.now();
    const loadingMessages = [
        '🤖 AI is thinking...',
        '🧠 Processing query...',
        '⚡ Computing response...',
        '🔮 Analyzing input...'
    ];

    try {
        // Send random loading message
        await sock.sendMessage(senderId, {
            text: loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        });

        // Process AI request
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: message }] }]
        });
        const response = result.response.text();
        const processTime = ((Date.now() - startTime) / 1000).toFixed(1);

        // Simple formatted response
        const formattedResponse = `🤖 *AI Response :*\n\n${response}`;

        await sock.sendMessage(senderId, { text: formattedResponse });

    } catch (error) {
        if (error.message?.includes('429') && retryCount < 3) {
            await new Promise(r => setTimeout(r, retryCount * 2000));
            return handleAIQuery(sock, senderId, message, retryCount + 1);
        }
        
        console.error('AI Error:', error);
        await sock.sendMessage(senderId, {
            text: '❌ An error occurred while processing your request'
        });
    }
}

module.exports = { handleAIQuery };