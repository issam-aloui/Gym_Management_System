const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const {getCoordinates} = require("../services/geoservice")

exports.createGym = async (req, res) => {
  try {
    // Check if token exists
    const token = req.cookies.token;
    if (!token) {
      logger.warn("Unauthorized attempt to create a gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Decode token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Destructure the body from the request
    const { gymname, town, pricebymounth, phonenumber, email } = req.body;

    // Retrieve coordinates for the town
    logger.info(`Fetching coordinates for town: ${town}`);
    const { lat, lng } = await getCoordinates(town);

    if (!lat||!lng) {logger.warn("t9lwat");
      return res.status(400).json({ message: "All fields are required" });}
    // Check if all required fields are provided
    if (!gymname || !town || !lat || !lng || !pricebymounth || !phonenumber || !email) {
      logger.warn("Missing required fields in gym creation");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new gym instance
    const newGym = new Gym({
      name: gymname,
      town,
      coordinates: { lng, lat },
      owner: userId,
      pricePerMonth: pricebymounth,
      contact: { phonenumber: phonenumber, email },
    });

    // Save the new gym
    await newGym.save();

    logger.info(`Gym created: "${gymname}" by User ID: ${userId}`);

    // Respond with the newly created gym
    res.status(201).json({ message: "Gym created successfully", gym: newGym });
  } catch (error) {
    logger.error(`Gym creation failed: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({}, 'name coordinates town'); // Select only required fields
    res.status(200).json(gyms);
  } catch (error) {
    logger.error(`Couldn't fetch gyms: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};




