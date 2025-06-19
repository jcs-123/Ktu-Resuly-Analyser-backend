const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  DEP: {
    type: String,
    required: true, 
  },
  SEM: {
    type: String,
    required: true, 
  },
  SUBJETCODE: {
    type: String,
    required: true, 
  },
  SUBJECT: {
    type: String,
    required: true, 
  },
  CREDIT: {
    type: Number,
    required: true, 
  }
}, { timestamps: true });

const depdatas = mongoose.model('depdatas', subjectSchema);

module.exports = depdatas;
