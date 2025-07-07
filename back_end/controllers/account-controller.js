const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");
const Announcement = require("../models/announcement");

exports.getUsername = (request, response) => {
  let token = request.cookies.token;
  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return response.json({ username: decoded.username });
  } catch {
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.getinfo = async (request, response) => {
  const token = request.cookies.token;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    return response.status(200).json({
      username: user.username,
      id: user.id,
      phone: user.phone,
      email: user.email,
      qrcode: user.Qrcode || "",
    });
  } catch (error) {
    logger.error(`Get user info failed: ${error.message}`);
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.changeUsername = async (request, response) => {
  let token = request.cookies.token;
  let { username1, username2 } = request.body;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  if (username1 !== username2) {
    return response
      .status(400)
      .json({ message: "Please provide matching usernames" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { username: username1 },
      { new: true }
    );

    if (!updatedUser) {
      return response.status(404).json({ message: "User not found" });
    }

    const newToken = jwt.sign(
      { id: decoded.id, username: updatedUser.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    response.cookie("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    response
      .status(200)
      .json({ message: "Username changed!", token: newToken });
  } catch (error) {
    logger.error(`Change name failed: ${error.message}`);
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.changeEmail = async (request, response) => {
  let token = request.cookies.token;
  let { email1, email2 } = request.body;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id, email: email1 });
    if (!user) {
      return response.status(400).json({ message: "Incorrect current email" });
    }

    const emailExists = await User.findOne({ email: email2 });
    if (emailExists) {
      return response.status(400).json({ message: "Email already taken" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: decoded.id },
      { email: email2 },
      { new: true }
    );

    if (!updatedUser) {
      return response.status(404).json({ message: "User not found" });
    }
    //change this part so it edit old token
    const newToken = jwt.sign(
      { Oid: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    response.cookie("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return response
      .status(200)
      .json({ message: "Email changed!", token: newToken });
  } catch (error) {
    logger.error(`Change email failed: ${error.message}`);
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.changePassword = async (request, response) => {
  let token = request.cookies.token;
  let { currentPassword, confirmPassword, newPassword } = request.body;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  if (confirmPassword !== newPassword) {
    return response
      .status(400)
      .json({ message: "Please provide matching new passwords" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.Oid });
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    const checkPassword = await bcrypt.compare(currentPassword, user.password);
    if (!checkPassword) {
      return response.status(400).json({ message: "Wrong old password" });
    }

    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    await User.updateOne({ _id: decoded.Oid }, { password: hashedPassword });

    const newToken = jwt.sign(
      { Oid: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    response.cookie("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    response
      .status(200)
      .json({ message: "Password changed successfully!", token: newToken });
  } catch (error) {
    logger.error(`Change password failed: ${error.message}`);
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.deleteAccount = async (request, response) => {
  let token = request.cookies.token;
  let { password } = request.body;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.Oid });
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({ message: "Wrong password" });
    }

    await User.deleteOne({ _id: decoded.Oid });

    response.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return response.json({ message: "Account deleted successfully" });
  } catch (error) {
    logger.error(`Delete account failed: ${error.message}`);
    return response.status(403).json({ message: "Invalid Token" });
  }
};

exports.getLastnotifications = async (request, response) => {
  const token = request.cookies.token;

  if (!token) {
    return response
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const announcements = await Announcement.find({ owner: decoded.Oid })
      .sort({ createdAt: -1 })
      .limit(5);

    return response.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
  }
};
exports.getUsernameFromId = async (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    return response.status(200).json({ username: user.username });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
  }
};
