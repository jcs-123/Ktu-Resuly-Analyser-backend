const ExcelUpload = require('../model/ExcelUpload');
const path = require('path');
const fs = require('fs'); // ✅ Required for reading files

// ✅ Upload Excel File and Save Metadata to DB
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join('upload', req.file.filename); // relative path for frontend

    const newExcel = new ExcelUpload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await newExcel.save();

    res.status(200).json({
      message: 'Excel uploaded and saved successfully',
      file: {
        name: req.file.filename,
        original: req.file.originalname,
        path: filePath,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error while uploading file' });
  }
};

// ✅ GET all uploaded Excel metadata from MongoDB
exports.getAllExcelFiles = async (req, res) => {
  try {
    const files = await ExcelUpload.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(files);
  } catch (err) {
    console.error('Failed to fetch Excel files from DB:', err);
    res.status(500).json({ error: 'Error fetching Excel file list' });
  }
};

// ✅ GET specific Excel file for download
exports.downloadExcelFile = (req, res) => {
  const fileName = req.params.filename;

  // Prevent directory traversal attack
  if (fileName.includes('..') || fileName.includes('/')) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  const filePath = path.join(__dirname, '../upload', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath);
};
