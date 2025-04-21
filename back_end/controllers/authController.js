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

   
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Email is already signed up buddy" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({ username, email, password: hashedPassword });

    try {
      await newUser.save();

   
      const qrData = `user_id:${newUser.id}-name:${newUser.username}-email${newUser.email}`;
      const qrPath = path.join(__dirname, `../qr-codes/user-${newUser.id}.png`);

  
      await QRCode.toFile(qrPath, qrData, {
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      logger.info(`QR code generated for user ${newUser.id}`);

      const uploadResult = await uploadImage(qrPath, {
        folder: "user-qrcodes",
        public_id: `user-${newUser.id}`,
        overwrite: true,
      });

      logger.info(
        `QR code uploaded for user ${newUser.id}: ${uploadResult.secure_url}`
      );

     
      fs.unlink(qrPath, (err) => {
        if (err) {
          logger.error(`Failed to delete local QR code: ${err.message}`);
        } else {
          logger.info(`Local QR code deleted for user ${newUser.id}`);
        }
      });


      newUser.Qrcode = uploadResult.secure_url;
      await newUser.save();

      logger.info(`User created: ${username} with email: ${email}`);
      res.status(201).json({ message: "User registered!", id: newUser.id });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ message: "Email is already in use. Try another one!" });
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
    const { username, password, remember } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const payload = { id: user.id, username: user.username, role: user.role };
    let token;

    if (remember) {
      token = jwt.sign(payload, process.env.JWT_SECRET);
    } else {
      token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
    }

    // now you can use `token` below

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
