const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");


exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res
        .status(400)
        .json({ message: "Email is already signed up buddy" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
      await newUser.save();
      const qrData = `user_id:${newUser.id}`;
      const qrPath = path.join(__dirname, `../qr-codes/user-${newUser.id}.png`);

      QRCode.toFile(
        qrPath,
        qrData,
        {
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        function (err) {
          if (err) {
            logger.error(
              `Failed to create QR code for user ${newUser.id}: ${err.message}`
            );
          } else {
            logger.info(`QR code generated for user ${newUser.id}`);
          }
        }
      );

      logger.info(`User created: "${username}" as email: ${email}`);
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ message: "Email is already in use. Try another one!" });
      }
      throw err;
    }

    res.status(201).json({ message: "User registered!", id: newUser.id });
  } catch (err) {
    logger.error(`User signup failed: ${err.message}`);

    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    logger.info(`user logged in: ${username}`);

    res.json({ message: "Login successful!" });
  } catch (error) {
    logger.error(`User login failed: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  logger.info("A user logged out");
  return res.json({ message: "Logged out successfully" });
};
