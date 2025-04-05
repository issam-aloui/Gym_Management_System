const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

// Get the username of the currently logged-in user
exports.getUsername = (req, res) => {
  let token = req.cookies.token;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ username: decoded.username });
  } catch (err) {
    // Handle invalid token
    return res.status(403).json({ message: "Invalid Token" });
  }
};

// Change the username of the currently logged-in user
exports.changeUsername = async (req, res) => {
  let token = req.cookies.token;
  let { username1, username2 } = req.body;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Ensure the new usernames match
  if (username1 !== username2) {
    return res.status(400).json({ message: "Please provide matching usernames" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update the username in the database
    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { username: username1 },
      { new: true }
    );

    // Handle user not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new token with the updated username
    const newToken = jwt.sign(
      { id: decoded.id, username: updatedUser.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the new token in the cookie
    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ message: "Username changed!", token: newToken });
  } catch (err) {
    logger.error(`Change name failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

// Change the email of the currently logged-in user
exports.changeEmail = async (req, res) => {
  let token = req.cookies.token;
  let { email1, email2 } = req.body;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the current email matches
    const user = await User.findOne({ id: decoded.id, email: email1 });
    if (!user) {
      return res.status(400).json({ message: "Incorrect current email" });
    }

    // Check if the new email is already taken
    const emailExists = await User.findOne({ email: email2 });
    if (emailExists) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Update the email in the database
    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { email: email2 },
      { new: true }
    );

    // Handle user not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new token with the updated email
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, email: email2, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the new token in the cookie
    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    return res.status(200).json({ message: "Email changed!", token: newToken });
  } catch (err) {
    logger.error(`Change email failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

// Change the password of the currently logged-in user
exports.changePassword = async (req, res) => {
  let token = req.cookies.token;
  let { pass1, pass2, pass3 } = req.body;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Ensure the new passwords match
  if (pass2 !== pass3) {
    return res.status(400).json({ message: "Please provide matching new passwords" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the old password is correct
    const checkPassword = await bcrypt.compare(pass1, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(pass2, 10);
    await User.updateOne({ id: decoded.id }, { password: hashedPassword });

    // Generate a new token
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the new token in the cookie
    res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ message: "Password changed successfully!", token: newToken });
  } catch (err) {
    logger.error(`Change password failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

// Delete the account of the currently logged-in user
exports.deleteAccount = async (req, res) => {
  let token = req.cookies.token;
  let { password } = req.body;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Delete the user from the database
    await User.deleteOne({ id: decoded.id });

    // Clear the token cookie
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    logger.error(`Delete account failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};
