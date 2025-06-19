const DepData = require('../model/depdatamodel'); // adjust path if needed

// @desc Get all subjects or filter by department and/or semester
// @route GET /api/depdata?DEP=AD&SEM=S3
exports.getDepData = async (req, res) => {
  try {
    const { DEP, SEM } = req.query;

    const filter = {};
    if (DEP) filter.DEP = DEP;
    if (SEM) filter.SEM = SEM;

    const data = await DepData.find(filter).sort({ SEM: 1, "SUBJECT CODE": 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching depdata:", error);
    res.status(500).json({ message: 'Failed to fetch department data', error: error.message });
  }
};

// add
// @desc Add new subject/department data
// @route POST /api/depdata
exports.addDepData = async (req, res) => {
  try {
    const { DEP, SEM, SUBJETCODE, SUBJECT, CREDIT } = req.body; // ✅ Fixed typo: SUBJECTCODE

    // Validate required fields
    const missingFields = [];
    if (!DEP) missingFields.push({ field: 'DEP', message: 'Department code is required' });
    if (!SEM) missingFields.push({ field: 'SEM', message: 'Semester is required' });
    if (!SUBJETCODE) missingFields.push({ field: 'SUBJETCODE', message: 'Subject code is required' });
    if (!SUBJECT) missingFields.push({ field: 'SUBJECT', message: 'Subject name is required' });
    if (CREDIT === undefined) missingFields.push({ field: 'CREDIT', message: 'Credit value is required' });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: missingFields
      });
    }

    // Validate CREDIT
    const creditValue = parseInt(CREDIT);
    if (isNaN(creditValue)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit value',
        errors: [{ field: 'CREDIT', message: 'Must be a valid number', received: CREDIT }]
      });
    }

    if (!Number.isInteger(creditValue)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit value',
        errors: [{ field: 'CREDIT', message: 'Must be a whole number (no decimals)', received: CREDIT }]
      });
    }

    if (creditValue < 0 || creditValue > 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit value',
        errors: [{
          field: 'CREDIT',
          message: 'Must be between 0 and 10 (inclusive)',
          received: creditValue
        }]
      });
    }

    // Check for existing subject
    const existingSubject = await DepData.findOne({
      $or: [
        { SUBJETCODE: { $regex: new RegExp(`^${SUBJETCODE}$`, 'i') } },
        { SUBJECT: { $regex: new RegExp(`^${SUBJECT}$`, 'i') } }
      ]
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: 'Subject already exists',
        conflict: {
          existingCode: existingSubject.SUBJECTCODE,
          existingName: existingSubject.SUBJECT
        }
      });
    }

    // Create new subject
    const newSubject = await DepData.create({
      DEP: DEP.trim().toUpperCase(),
      SEM: SEM.trim().toUpperCase(),
      SUBJETCODE: SUBJETCODE.trim().toUpperCase(),
      SUBJECT: SUBJECT.trim(),
      CREDIT: creditValue
    });

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      data: {
        id: newSubject._id,
        DEP: newSubject.DEP,
        SEM: newSubject.SEM,
        SUBJETCODE: newSubject.SUBJECTCODE,
        SUBJECT: newSubject.SUBJECT,
        CREDIT: newSubject.CREDIT,
        createdAt: newSubject.createdAt
      }
    });

  } catch (error) {
    console.error('Server error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate subject detected',
        duplicateField: Object.keys(error.keyPattern)[0]
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};