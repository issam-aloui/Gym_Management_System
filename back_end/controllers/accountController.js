const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

exports.getUsername = (req, res) => {
  let token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ username: decoded.username });
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

exports.changeUsername = async (req, res) => {
  let token = req.cookies.token;
  let { username1, username2 } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (username1 !== username2) {
    return res.status(400).json({ message: "Please provide matching usernames" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { username: username1 },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newToken = jwt.sign(
      { id: decoded.id, username: updatedUser.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ message: "Username changed!", token: newToken });
  } catch (err) {
    logger.error(`Change name failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

exports.changeEmail = async (req, res) => {
  let token = req.cookies.token;
  let { email1, email2 } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id, email: email1 });
    if (!user) {
      return res.status(400).json({ message: "Incorrect current email" });
    }

    const emailExists = await User.findOne({ email: email2 });
    if (emailExists) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { email: email2 },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, email: email2, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    return res.status(200).json({ message: "Email changed!", token: newToken });
  } catch (err) {
    logger.error(`Change email failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

exports.changePassword = async (req, res) => {
  let token = req.cookies.token;
  let { pass1, pass2, pass3 } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (pass2 !== pass3) {
    return res.status(400).json({ message: "Please provide matching new passwords" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkPassword = await bcrypt.compare(pass1, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    const hashedPassword = await bcrypt.hash(pass2, 10);

    await User.updateOne({ id: decoded.id }, { password: hashedPassword });

    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ message: "Password changed successfully!", token: newToken });
  } catch (err) {
    logger.error(`Change password failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

exports.deleteAccount = async (req, res) => {
  let token = req.cookies.token;
  let { password } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    await User.deleteOne({ id: decoded.id });

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    logger.error(`Delete account failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};
