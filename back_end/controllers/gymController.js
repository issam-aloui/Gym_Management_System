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
      return res.status(401).json({ message: "All fields are required" });
    }

    if(user.Gymowned) {res.status(400).json({ message: "You already own a gym buddy" })}

    const { gymname, town, pricebymounth, phonenumber, email } = req.body;
    const { lat, lng } = await getCoordinates(town);

    const pass = generatePassword(13);

    if (!lat || !lng) {
      logger.warn("town coocked in map (fuck isreal if he choosed it)");
      return res
        .status(400)
        .json({ message: "Couldn’t generate lat/lng. Try a different town." });
    }

    if (
      !gymname ||
      !town ||
      !pricebymounth ||
      !phonenumber ||
      !email ||
      !pass
    ) {
      logger.warn("Missing required fields in gym creation");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new gym (not saved yet)
    const newGym = new Gym({
      name: gymname,
      town,
      coordinates: { lng, lat },
      owner: userId,
      pricePerMonth: pricebymounth,
      contact: { phonenumber, email },
      Secretpass: pass,
    });

    // Create statistiques doc and link it to gym
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

    
    user.Gymowned = newGym;
    user.role = "owner";
    await user.save();

    logger.info(`Gym created: "${gymname}" by User ID: ${userId}`);

    const newToken = jwt.sign(
      { Oid: user._id, role: user.role , username:user.username },
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

    const gymId = Gym.findOne({ owner:userId });

    res.status(200).json({gymId});
  } catch (err) {
    res.status(400).json({ message: "servererror" });
  }
};
