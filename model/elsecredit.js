const mongoose = require('mongoose');

const elsecreditSchema = new mongoose.Schema({
  DEP: {
    type: String,
    required: true, // Department code, e.g., "CE"
  },
  SEM: {
    type: String,
    required: true, // Semester, e.g., "S3"
  },
  SUBJECTCODE: {
    type: String,
    required: true, // Subject code, e.g., "GCEST203"
  },
  SUBJECT: {
    type: String,
    required: true, // Subject name, e.g., "Mechanics of Solids"
  },
  CREDIT: {
    type: Number,
    required: true, // Credit points, e.g., 3
  },
}, { timestamps: true });

// ✅ Safe export (prevents OverwriteModelError)
module.exports =
  mongoose.models.elsecredit ||
  mongoose.model('elsecredit', elsecreditSchema);
