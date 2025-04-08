const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

exports.createGym = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      logger.warn("Unauthorized attempt to create a gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { gymname, town, latitude, long, pricebymounth, phonenumber, email } = req.body;

    if (!gymname || !town || !latitude || !long || !pricebymounth || !phonenumber || !email) {
      logger.warn("Missing required fields in gym creation");
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGym = new Gym({
      name: gymname,
      town,
      gpsLocation: { latitude, longitude: long },
      owner: userId,
      pricePerMonth: pricebymounth,
      contact: { phone: phonenumber, email },
    });

    await newGym.save();

    logger.info(`Gym created: "${gymname}" by User ID: ${userId}`);

    res.status(201).json({ message: "Gym created successfully", gym: newGym });
  } catch (error) {
    logger.error(`Gym creation failed: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find();
    res.status(200).json(gyms);
  } catch (error) {
    logger.error(`Couldn't fetch gyms: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
