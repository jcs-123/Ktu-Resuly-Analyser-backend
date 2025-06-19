const Register = require('../model/registermodel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 🔧 Bluehost mail transporter setup


const transporter = nodemailer.createTransport({
  service: 'gmail', // use built-in service for Gmail
  auth: {
    user: 'jcs@jecc.ac.in',         // your full Gmail address
    pass: 'csaw xqnr tdhw pcug'    // 16-char app password from Google
  }
});

// ============ Register User ============
exports.addRegister = async (req, res) => {
  try {
    const { fullName, occupation, college, email, password, confirmPassword } = req.body;

    if (!fullName || !occupation || !college || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Register({
      fullName,
      occupation,
      college,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error in addRegister:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ Login User ============
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ Forgot Password (OTP Send) ============
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Register.findOne({ email });

    if (!user) {
      console.log(`Forgot password attempt for non-existing email: ${email}`);
      return res.status(200).json({
        message: 'Email not registered',
        emailExists: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    user.resetOTP = otp;
    user.resetOTPExpires = expires;
    await user.save();

    console.log(`Generated OTP: ${otp} for ${email}`);

    await transporter.sendMail({
      from: '"KTU Result Analyzer" <you@yourdomain.com>',
      to: email,
      subject: 'Your KTU Result Analyzer Reset Password OTP',
      html: `
  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #1d4ed8;">🔐 Password Reset Request</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password for your <strong>KTU Result Analyzer</strong> account.</p>
    <p style="margin: 20px 0; font-size: 16px;">Use the following OTP to reset your password:</p>
    <div style="text-align: center;">
      <h1 style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 32px; letter-spacing: 4px;">
        ${otp}
      </h1>
    </div>
    <p style="margin-top: 20px;">This OTP is valid for <strong>10 minutes</strong>.</p>
    <hr style="margin: 30px 0;" />
    <p style="font-size: 14px; color: #555;">If you didn't request a password reset, you can safely ignore this email.</p>
    <p style="font-size: 14px; color: #999; margin-top: 30px;">— KTU Result Analyzer Team (JCS)</p>
  </div>
      `
    });

    console.log(`OTP email sent to: ${email}`);
    res.status(200).json({
      message: 'OTP sent successfully to your email',
      emailExists: true,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ Reset Password ============
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {
    // ✅ Validate all fields
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // ✅ Check password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // ✅ Find user
    const user = await Register.findOne({ email });

    // ✅ Validate user, OTP and expiry
    if (
      !user ||
      user.resetOTP !== otp ||
      !user.resetOTPExpires ||
      user.resetOTPExpires < Date.now()
    ) {
      console.log("Reset failed - OTP mismatch or expired:");
      console.log("User:", user?.email);
      console.log("Stored OTP:", user?.resetOTP);
      console.log("Provided OTP:", otp);
      console.log("Expires:", new Date(user?.resetOTPExpires));
      console.log("Now:", new Date());
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password and clear OTP
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
