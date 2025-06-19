const mongoose = require('mongoose');

const semesterCreditSchema = new mongoose.Schema({
  DEP: {
    type: String,
    required: true, // Department code, e.g., "AD"
  },
  SEM: {
    type: String,
    required: true, // Semester, e.g., "S3"
  },
 TOTALCREDIT: {
    type: Number,
    required: true, // Total credit for the semester, e.g., 16
  }
}, { timestamps: true });

const semesterCredits = mongoose.model('semestercredits', semesterCreditSchema);

module.exports = semesterCredits;
