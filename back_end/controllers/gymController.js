const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { getCoordinates } = require("../services/geoservice");
const { generatePassword } = require("../utils/passwordGen");
const Statistiques = require("../models/statistiques");
const Gymdes = require("../models/GymDescription");
const User = require("../models/User"); // DO ME PLEASE DONT FORGET ME

exports.createGym = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      logger.warn("Unauthorized attempt to create a gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId);

    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.Gymowned) {
      logger.warn(`User ${userId} attempted to create another gym`);
      return res.status(400).json({ error: "You have already created a gym." });
    }

    const { gymname, town, pricebymounth, phonenumber, email } = req.body;
    const { lat, lng } = await getCoordinates(town);
    const pass = generatePassword(13);

    if (!lat || !lng) {
      logger.warn("Town not found on map");
      return res
        .status(400)
        .json({ message: "Invalid town. Try another one." });
    }

    if (!gymname || !town || !pricebymounth || !phonenumber || !email) {
      logger.warn("Missing required fields in gym creation");
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGym = new Gym({
      name: gymname,
      town,
      coordinates: { lng, lat },
      owner: userId,
      pricePerMonth: pricebymounth,
      contact: { phonenumber, email },
      Secretpass: pass,
    });

    const statistiques = new Statistiques({
      Gymid: newGym._id,
      totalMembers: 0,
      dailyCheckIns: 0,
      newSignUps: 0,
      classes: {
        allclasses: [],
        Totalclasses: 0,
        classesattended: 0,
      },
      members: [],
      trainers: [],
    });

    await statistiques.save();
    newGym.statistiques = statistiques._id;

    await newGym.save();

    user.Gymowned = newGym._id;
    user.role = "owner";
    await user.save();

    logger.info(`Gym created: "${gymname}" by User ID: ${userId}`);

    const newToken = jwt.sign(
      { Oid: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(201).json({
      message: "Gym and statistics created successfully",
      gym: newGym,
      secretPass: pass,
    });
  } catch (error) {
    logger.error(`Gym creation failed: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({}, "name coordinates town");
    res.status(200).json(gyms);
  } catch (error) {
    logger.error(`Couldn't fetch gyms: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getgym = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    logger.warn("Unauthorized attempt to get a gym");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    if (decoded.role !== "owner") {
      logger.warn("Unauthorized attempt to get a gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const gym = await Gym.findOne({ owner: userId });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }
    return res.status(200).json({ gymId: gym._id });
  } catch (err) {
    return res.status(400).json({ message: "servererror" });
  }
};
exports.leaveGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const token = req.cookies.token;
    if (!token) {
      logger.warn("Unauthorized attempt to leave a gym");
      return res.status(401).json({ message: "Unauthorized" });
    }
    let check = await Gym.findById(gymId);
    if (!check) {
      return res.status(404).json({ message: "Gym not found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;
    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { Gymsjoined: gymId } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    const statistics = await Statistiques.findById(check.statistiques);
    if (!statistics) {
      return res.status(404).json({ message: "Statistics not found" });
    }
    statistics.members = statistics.members.filter(
      (member) => member.toString() !== userId
    );
    statistics.totalMembers -= 1;
    await statistics.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
