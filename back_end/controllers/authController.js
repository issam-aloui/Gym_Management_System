const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

// Signup controller: Handles user registration
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email is already signed up buddy" });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    try {
      // Save the new user to the database
      await newUser.save();
      logger.info(`User created: "${username}" as email: ${email}`);
    } catch (err) {
      // Handle duplicate email error
      if (err.code === 11000) {
        return res.status(400).json({ message: "Email is already in use. Try another one!" });
      }
      throw err;
    }

    // Respond with success message and user ID
    res.status(201).json({ message: "User registered!", id: newUser.id });
  } catch (err) {
    // Log and handle unexpected errors
    logger.error(`User signup failed: ${err.message}`);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

// Login controller: Handles user authentication
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    logger.info(`User logged in: ${username}`);

    // Respond with a success message
    res.json({ message: "Login successful!" });
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`User login failed: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout controller: Handles user logout
exports.logout = (req, res) => {
  // Clear the authentication token cookie
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
  logger.info("A user logged out");

  // Respond with a success message
  return res.json({ message: "Logged out successfully" });
};
