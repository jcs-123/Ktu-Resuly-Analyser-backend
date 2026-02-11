const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  occupation: {
    type: String,
    default: 'google-user',
  },

  college: {
    type: String,
    default: 'Not Provided',
  },

  authProvider: {
    type: String,
    default: 'google',
  }

}, { timestamps: true });

module.exports = mongoose.model('GoogleRegister', registerSchema);
