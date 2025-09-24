const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email taken' });
  const user = new User({ name, email, password, role });
  await user.save();
  const token = generateToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.forgotPassword = async (req, res) => {
  // Normalize and basic validation (avoid leaking existence)
  const rawEmail = typeof req.body.email === 'string' ? req.body.email : '';
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  // Reuse existing non-expired token to throttle requests; otherwise create a new one
  let token = user.resetPasswordToken;
  const tokenStillValid = user.resetPasswordExpires && user.resetPasswordExpires > Date.now();
  if (!token || !tokenStillValid) {
    token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#222">
      <h2>Password reset</h2>
      <p>We received a request to reset the password for your account.</p>
      <p>
        Click the link below to set a new password (valid for 1 hour):
      </p>
      <p>
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block">
          Reset your password
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail(email, 'Password reset', html);
  } catch (err) {
    // Do not leak errors; log and still return generic response
    console.error('forgotPassword email send error:', err && err.message ? err.message : err);
  }

  return res.json({ message: 'If that email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;
  const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password changed' });
};
