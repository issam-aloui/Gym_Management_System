const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");
const QRCode = require("qrcode");
const path = require("node:path");
const fs = require("node:fs");
const { v2: cloudinary } = require("cloudinary");
const { uploadImage } = require("../services/cloud-service");
const { unlink } = require("node:fs/promises");
exports.signup = async (request, response) => {
  try {
    const { username, email, password } = request.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return response
        .status(400)
        .json({ message: "Email is already signed up buddy" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });

    try {
      await newUser.save();

      const qrData = `user_id:${newUser._id}-name:${newUser.username}-email:${newUser.email}`;
      const baseDirectory = path.resolve(__dirname, "../qr-codes");
      const qrPath = path.resolve(baseDirectory, `user-${newUser.id}.png`);
      if (!qrPath.startsWith(baseDirectory)) {
        logger.warn("Blocked potential path traversal attempt.");
        return response.status(400).json({ message: "Invalid QR path" });
      }

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
      try {
        const qrFilePath = path.resolve(
          baseDirectory,
          `user-${newUser.id}.png`
        );
        await unlink(qrFilePath);
        logger.info(`Deleted QR for user ${newUser.id}`);
      } catch (error) {
        logger.error(`Failed to delete QR: ${error.message}`);
      }

      newUser.Qrcode = uploadResult.secure_url;
      await newUser.save();

      logger.info(`User created: ${username} with email: ${email}`);
      const payload = {
        Oid: newUser._id,
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      };
      let token;
      token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      response.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      response
        .status(201)
        .json({ message: "User registered!", id: newUser.id });
    } catch (error) {
      if (error.code === 11_000) {
        return response
          .status(400)
          .json({ message: "Email is already in use. Try another one!" });
      }
      throw error;
    }
  } catch (error) {
    logger.error(`User signup failed: ${error.message}`);
    response
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

exports.login = async (request, response) => {
  try {
    const { username, password, remember } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      return response
        .status(400)
        .json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response
        .status(400)
        .json({ message: "Invalid username or password" });
    }
    const payload = {
      Oid: user._id,
      id: user.id,
      username: user.username,
      role: user.role,
    };
    let token;

    token = remember
      ? jwt.sign(payload, process.env.JWT_SECRET)
      : jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

    // now you can use `token` below

    response.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    logger.info(`user logged in: ${username}`);

    response.json({ message: "Login successful!" });
  } catch (error) {
    logger.error(`User login failed: ${error.message}`);
    response.status(500).json({ message: "Server error" });
  }
};

exports.logout = (request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  logger.info("A user logged out");
  return response.json({ message: "Logged out successfully" });
};
