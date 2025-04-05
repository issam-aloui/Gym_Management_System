const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Controller to handle gym creation
exports.createGym = async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;
    if (!token) {
      logger.warn("Unauthorized attempt to create a gym");
      return res.status(401).json({ message: "Unauthorized" }); // Return 401 if no token is provided
    }

    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Destructure required fields from the request body
    const { gymname, town, latitude, long, pricebymounth, phonenumber, email } = req.body;

    // Check if all required fields are provided
    if (!gymname || !town || !latitude || !long || !pricebymounth || !phonenumber || !email) {
      logger.warn("Missing required fields in gym creation");
      return res.status(400).json({ message: "All fields are required" }); // Return 400 if any field is missing
    }

    // Create a new gym instance
    const newGym = new Gym({
      name: gymname,
      town,
      gpsLocation: { latitude, longitude: long },
      owner: userId,
      pricePerMonth: pricebymounth,
      contact: { phone: phonenumber, email },
    });

    // Save the new gym to the database
    await newGym.save();

    logger.info(`Gym created: "${gymname}" by User ID: ${userId}`); // Log successful creation

    // Respond with success message and the created gym
    res.status(201).json({ message: "Gym created successfully", gym: newGym });
  } catch (error) {
    logger.error(`Gym creation failed: ${error.message}`); // Log error details
    res.status(500).json({ message: "Server error" }); // Return 500 for server errors
  }
};

// Controller to fetch all gyms
exports.getGyms = async (req, res) => {
  try {
    // Fetch all gyms from the database
    const gyms = await Gym.find();
    res.status(200).json(gyms); // Respond with the list of gyms
  } catch (error) {
    logger.error(`Couldn't fetch gyms: ${error.message}`); // Log error details
    res.status(500).json({ message: "Server error" }); // Return 500 for server errors
  }
};
