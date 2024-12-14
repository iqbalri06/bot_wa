const config = require('../config/config');

const mainMenu = `
╭━━━━「 *${config.botName}* 」━━━━╮
┃                              
┃     WELCOME TO BOT MENU      
┃                              
╰━━━━━━━━━━━━━━━━━━━╯

┏━━━━『 MAIN MENU 』━━━━┓
┃                              
┃ [1] 🤖 AI Assistant
┃     • Chat with AI 
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

Reply with number (1-7) to select`;

module.exports = mainMenu;