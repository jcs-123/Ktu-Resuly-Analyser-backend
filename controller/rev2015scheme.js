const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const Revision2015 = require('../model/rev2015scheme');

// Upload & Parse PDF
exports.uploadRevision2015File = async (req, res) => {
  try {
    if (!req.file || !req.body.email) {
      return res.status(400).json({ error: 'File and email are required' });
    }

    const { filename, originalname, mimetype, size, path } = req.file;
    const { email } = req.body;

    const fileData = {
      filename,
      originalname,
      mimetype,
      size,
      path,
      uploadDate: new Date()
    };

    // Read and parse the PDF
    const fileBuffer = await fs.readFile(path);
    const parsedPDF = await pdfParse(fileBuffer);
    const extractedText = parsedPDF.text || '';

    // Save to DB
    const savedData = await Revision2015.findOneAndUpdate(
      { 'file.filename': filename },
      {
        email,
        file: fileData,
        parsedContent: extractedText
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'File uploaded, parsed, and saved successfully',
      id: savedData._id,
      email: savedData.email,
      file: savedData.file
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Latest Parsed Data (optional filter by email)
exports.getRevision2015Data = async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};

    // Get latest entry, only needed fields
    const latestDoc = await Revision2015.findOne(query, {
      _id: 1,
      email: 1,
      parsedContent: 1,
      'file.originalname': 1,
      'file.filename': 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    if (!latestDoc) {
      return res.status(404).json({ message: 'No data found' });
    }

    return res.status(200).json(latestDoc);

  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
