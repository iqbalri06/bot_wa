// games/rpsGame.js

const gameState = new Map();

const choices = ['batu', 'gunting', 'kertas'];
const emojis = {
    'batu': '🗿',
    'gunting': '✂️',
    'kertas': '📄'
};

function determineWinner(playerChoice, botChoice) {
    if (playerChoice === botChoice) return 'draw';
    if (
        (playerChoice === 'batu' && botChoice === 'gunting') ||
        (playerChoice === 'gunting' && botChoice === 'kertas') ||
        (playerChoice === 'kertas' && botChoice === 'batu')
    ) {
        return 'win';
    }
    return 'lose';
}

async function handleRPSGame(sock, senderId, text) {
    // Initialize or get game state
    if (!gameState.has(senderId)) {
        gameState.set(senderId, { score: 0 });
    }
    const playerState = gameState.get(senderId);
    
    // Clean input text - handle both string and array inputs
    const input = Array.isArray(text) ? text.join(' ').toLowerCase().trim() : text.toLowerCase().trim();

    // Show menu if command is !suit or empty
    if (input === '!suit' || !input) {
        const menuMessage = `🎮 *SUIT GAME*

Pilih Senjatamu:
${emojis.batu} Batu
${emojis.gunting} Gunting
${emojis.kertas} Kertas

🏆 Skor: ${playerState.score}

✨ Ketik: batu/gunting/kertas`;

        await sock.sendMessage(senderId, { text: menuMessage });
        return;
    }

    // Check if input is a valid move
    if (choices.includes(input)) {
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const result = determineWinner(input, botChoice);

        // Update score
        if (result === 'win') playerState.score += 1;
        if (result === 'lose') playerState.score = Math.max(0, playerState.score - 1);

        const battleEmojis = {
            'win': '⚔️',
            'lose': '💥',
            'draw': '🔄'
        };

        const resultMessages = {
            'win': '🌟 Kemenangan!',
            'lose': '💫 Kalah!',
            'draw': '🤝 Seri!'
        };

        const gameMessage = `${battleEmojis[result]} *SUIT*

${emojis[input]} VS ${emojis[botChoice]}

${resultMessages[result]}
🏆 Skor: ${playerState.score}

▸ Main lagi? Ketik pilihanmu!`;

        await sock.sendMessage(senderId, { text: gameMessage });
    }
}

// Make sure to export both the handler and game state
module.exports = {
    handleRPSGame,
    gameState
};