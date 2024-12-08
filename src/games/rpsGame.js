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
    
    // Clean input text
    const input = text.toLowerCase().trim();

    // Show menu if command is !suit
    if (input === '!suit') {
        const menuMessage = `╔══『 🎮 *SUIT GAME* 』══╗

📍 *Cara Main:*
╎ • Ketik langsung:
╎ 🗿 batu
╎ ✂️ gunting
╎ 📄 kertas

🏆 *Skor Kamu:* ${playerState.score}

_Ketik pilihanmu tanpa "!"_
╚═════════════════╝`;

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

        const resultMessages = {
            'win': '🎉 Kamu MENANG!',
            'lose': '😔 Kamu KALAH!',
            'draw': '🤝 SERI!'
        };

        const gameMessage = `╔══『 🎮 *HASIL SUIT* 』══╗

Kamu: ${emojis[input]} ${input}
Bot: ${emojis[botChoice]} ${botChoice}

${resultMessages[result]}
🏆 Skor: ${playerState.score}

_Main lagi? Ketik pilihanmu!_
╚═════════════════╝`;

        await sock.sendMessage(senderId, { text: gameMessage });
    }
}

// Make sure to export both the handler and game state
module.exports = {
    handleRPSGame,
    gameState
};