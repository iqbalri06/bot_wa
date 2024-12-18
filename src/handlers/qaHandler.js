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
  async findAnswer(text, sock, senderId) {
    try {
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

      const match = this.qaData.find(qa => {
        const cleanQuestion = qa.question.toLowerCase()
          .replace(/[?!.,]/g, '')
          .trim();
        return cleanInput.includes(cleanQuestion) || 
               cleanQuestion.includes(cleanInput);
      });

      if (!match) {
        // Fix: Pass parameters in correct order
        try {
          await handleAIQuery(sock, senderId, text);
          return null;
        } catch (error) {
          console.error('AI Error:', error);
          return 'Maaf, terjadi kesalahan dalam memproses pertanyaan Anda.';
        }
      }

      return match.answer;
    } catch (error) {
      console.error('QA Handler Error:', error);
      return null;
    }
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