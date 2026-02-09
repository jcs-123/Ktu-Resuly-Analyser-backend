const elsecrtedit = require('../model/elsecredit'); // adjust the path as needed

// GET /api/semester-credits?dep=AD&sem=S3
// Controller (backend)
exports.getelseSemesterCredit = async (req, res) => {
  try {
    const { dep, sem } = req.query;

    if (dep && sem) {
      const data = await elsecrtedit.findOne({ DEP: dep, SEM: sem });
      if (!data) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json([data]); // Wrap in array for consistency
    }

    const allCredits = await elsecrtedit.find();
    res.status(200).json(allCredits); // Return full list
  } catch (error) {
    console.error('Error fetching semester credit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
