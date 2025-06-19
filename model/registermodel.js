const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  }, // OTP and Password Reset Support
resetOTP: String,
resetOTPExpires: Number

}, { timestamps: true });

const Register = mongoose.model('Register', registerSchema);

module.exports = Register;
