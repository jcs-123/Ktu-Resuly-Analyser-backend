const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directory path (relative to this file)
// const uploadDir = path.join(__dirname, 'upload');
const uploadDir = path.join(__dirname, '..', 'upload'); // Go one level up to root

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const ext = path.extname(safeName); // Get file extension
    const baseName = path.basename(safeName, ext);
    const timestamp = Date.now();
    const finalName = `${baseName}-${timestamp}${ext}`;
    cb(null, finalName);
  }
});

// Define file type filter
const fileFilter = (req, file, cb) => {
const allowedTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel' // .xls
];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPEG, JPG, and PDF files are allowed.'));
  }
};

// Final multer config
const multerConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

module.exports = multerConfig;
