const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");
const generateToken = require("../middleware/tokenMiddleware");
const redis = require("../config/redis");
const { sendPasswordResetEmail } = require("../services/mailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const RESET_TOKEN_TTL = 15 * 60;

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!redis) {
      return res.status(500).json({ message: "Password reset is unavailable right now" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !user.password) {
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await redis.set(`passwordReset:${tokenHash}`, user.email, "EX", RESET_TOKEN_TTL);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send reset email", error: err.message });
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!redis) {
      return res.status(500).json({ message: "Password reset is unavailable right now" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const key = `passwordReset:${tokenHash}`;

    const email = await redis.get(key);
    if (!email) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    await user.save();

    await redis.del(key);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed", error: err.message });
  }
};

exports.googleVerify = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        password: null,
        googleId: sub,
        picture: picture || null,
      });
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    const jwtToken = generateToken(user);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Google verification failed", error: err.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = user.password
      ? await bcrypt.compare(password.trim(), user.password)
      : false;
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Failed to get user", error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.token;

    if (token && redis) {
      const decoded = jwt.decode(token);
      const ttl = decoded.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0) : 0;
      if (ttl > 0) {
        await redis.set(`blacklist:${token}`, "true", "EX", ttl);
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};
