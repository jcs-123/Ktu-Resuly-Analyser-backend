const Register = require('../model/registermodel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// 🔐 Validate env variables ON LOAD
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ GOOGLE_CLIENT_ID is missing in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // ✅ Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, email, name } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ message: "Invalid Google account" });
    }

    // ✅ Find or create user
    let user = await Register.findOne({ email });

    if (!user) {
      user = new Register({
        fullName: name,
        email: email,
        googleId: sub,
      });
      await user.save();
    }

    // ✅ Create JWT (SAFE)
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Google Auth Error:", error.message);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};
