const config = require('../config/config');

async function getMainMenu() {
    try {
        return {
            text: `╭━━━━「 *${config.botName}* 」━━━━╮
┃                              
┃     WELCOME TO BOT MENU      
┃                              
╰━━━━━━━━━━━━━━━━━━━╯

┏━━━━『 MAIN MENU 』━━━━┓
┃                              
┃ [1] 🤖 AI Assistant
┃
┃ [2] Anonymous Message       
┃
┃ [3] Bot Information        
┃
┃ [4] Fun Games             
┃
┃ [5] TikTok Downloader  
┃
┃ [6] Instagram Downloader    
┃
┃ [7] Create Sticker        
┃                              
┗━━━━━━━━━━━━━━━━━━━┛

Reply with number (1-7) to select`
        };
    } catch (error) {
        console.error('Error generating main menu:', error);
        return { text: '❌ Terjadi kesalahan dalam menampilkan menu' };
    }
}

module.exports = { getMainMenu };