const mongoose = require('mongoose');

const fileMetadataSchema = new mongoose.Schema({
  filename: { type: String, required: true },         // Server-stored name
  originalname: { type: String, required: true },     // User-uploaded name
  mimetype: { type: String, required: true },         // Should be 'application/pdf'
  size: { type: Number, required: true },             // In bytes
  path: { type: String, required: true },             // Server or S3 path
  uploadDate: { type: Date, default: Date.now, index: true } // Indexed for sorting
});

const revision2015Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  scheme: {
    type: String,
    enum: ['2015'],
    default: '2015'
  },
  file: {
    type: fileMetadataSchema,
    required: true
  },
  parsedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  }
}, { timestamps: true });

const Revision2015 = mongoose.model('Revision2015', revision2015Schema);

module.exports = Revision2015;
