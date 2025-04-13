const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const { uploadImage } = require("../services/cloudservice");


exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already signed up buddy" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });

    try {
      await newUser.save();

      // Generate QR data
      const qrData = `user_id:${newUser.id}`;
      const qrPath = path.join(__dirname, `../qr-codes/user-${newUser.id}.png`);

      // Generate QR code
      await QRCode.toFile(qrPath, qrData, {
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      logger.info(`QR code generated for user ${newUser.id}`);

      // Upload the generated QR code using the uploadImage function from services
      const uploadResult = await uploadImage(qrPath, {
        folder: "user-qrcodes",
        public_id: `user-${newUser.id}-${newUser.username}-${newUser.email}`,
        overwrite: true,
      });
      

      logger.info(`QR code uploaded for user ${newUser.id}: ${uploadResult.secure_url}`);

      // Delete local QR file after upload
      fs.unlink(qrPath, (err) => {
        if (err) {
          logger.error(`Failed to delete local QR code: ${err.message}`);
        } else {
          logger.info(`Local QR code deleted for user ${newUser.id}`);
        }
      });

      // Update the user with QR code URL and save it
      newUser.Qrcode = uploadResult.secure_url;
      await newUser.save();

      logger.info(`User created: ${username} with email: ${email}`);
      res.status(201).json({ message: "User registered!", id: newUser.id });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Email is already in use. Try another one!" });
      }
      throw err;
    }
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
