const fs = require('fs');
const { parse } = require('csv-parse/sync'); // Changed from csv-parse/sync to csv-parse

class QAHandler {
  constructor() {
    this.qaData = [];
  }

  // Load QA data from CSV file
  loadQAFromCSV(filepath) {
    try {
      const fileContent = fs.readFileSync(filepath, 'utf-8');
      const records = parse(fileContent, { // Changed from csv.parse to parse
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
        quote: '"',          // Enable quoted fields
        escape: '"',         // Escape character for quotes
        relax_column_count: true  // Be more forgiving
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

  // Find answer for given question
  findAnswer(text) {
    const normalizedInput = text.toLowerCase().trim();
    const cleanInput = normalizedInput.replace(/[?!.,]/g, '').trim();

    const match = this.qaData.find(qa => {
        const cleanQuestion = qa.question.toLowerCase()
            .replace(/[?!.,]/g, '')
            .trim();
        return cleanInput.includes(cleanQuestion) || 
               cleanQuestion.includes(cleanInput);
    });

    if (!match) {
        return `Maaf, saya tidak menemukan jawaban untuk pertanyaan tersebut 🙏`;
    }

    return match.answer;
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