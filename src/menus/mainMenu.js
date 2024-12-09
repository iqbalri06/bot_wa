const config = require('../config/config');

const mainMenu = `
╭━━━━「 *${config.botName}* 」━━━━╮
┃                              
┃     WELCOME TO BOT MENU      
┃                              
╰━━━━━━━━━━━━━━━━━━━╯

┏━━━━『 MAIN MENU 』━━━━┓
┃                              
┃ [1] Anonymous Message       
┃
┃ [2] Bot Information        
┃
┃ [3] Fun Games             
┃
┃ [4] TikTok Downloader     
┃
┃ [5] Instagram Downloader   
┃                              
┗━━━━━━━━━━━━━━━━━━━┛

Reply with number (1-5) to select`;

module.exports = mainMenu;