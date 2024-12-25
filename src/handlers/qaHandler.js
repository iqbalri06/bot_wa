const fs = require('fs');
const csv = require('csv-parse/sync');
const { handleAIQuery } = require('./aiHandler');

class QAHandler {
  constructor() {
    this.qaData = [];
  }

  // Load QA data from CSV file
  loadQAFromCSV(filepath) {
    try {
      const fileContent = fs.readFileSync(filepath, 'utf-8');
      const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true
      });

      this.qaData = records.map(record => ({
        question: record.question,
        answer: record.answer
      }));
    } catch (error) {
      console.error('Error loading QA data:', error);
      throw error;
    }
  }

  // Updated findAnswer method
  async findAnswer(text, sock, senderId, messageInfo) {
    try {
      // Check if message is a reply first
      const isReply = messageInfo.rawMessage && 
          (messageInfo.rawMessage.extendedTextMessage?.contextInfo?.stanzaId ||
           Object.values(messageInfo.rawMessage).some(msg => msg?.contextInfo?.stanzaId));

      if (isReply) {
        console.log('QA: Skipping reply message');
        return null;
      }

      // Validate message info structure
      if (!messageInfo?.key?.remoteJid || !messageInfo?.key?.id) {
        console.error('QA Handler: Invalid message info structure:', messageInfo);
        return null;
      }

      // Use message info for AI query if no QA match found
      const match = this.findQAMatch(text);
      if (!match) {
        await handleAIQuery(sock, senderId, text, 0, messageInfo.key);
        return null;
      }

      return match.answer;
    } catch (error) {
      console.error('QA Handler Error:', error);
      return null;
    }
  }

  findQAMatch(text) {
    // Strict input validation
    if (!text || typeof text !== 'string') {
      console.log('Invalid input type:', typeof text);
      return null;
    }

    const normalizedInput = String(text).toLowerCase().trim();
    if (!normalizedInput) {
      return null;
    }

    // Remove special characters and extra spaces
    const cleanInput = normalizedInput
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanInput) {
      return null;
    }

    return this.qaData.find(qa => {
      const cleanQuestion = qa.question.toLowerCase()
        .replace(/[?!.,]/g, '')
        .trim();
      return cleanInput.includes(cleanQuestion) || 
             cleanQuestion.includes(cleanInput);
    });
  }

  // Get all QA pairs
  getAllQA() {
    return this.qaData;
  }
}

module.exports = QAHandler;

// Usage example:
// const qaHandler = new QAHandler();
// qaHandler.loadQAFromCSV('qa_database.csv');
// const answer = qaHandler.findAnswer('Apa itu Wikfess?');
// console.log(answer);