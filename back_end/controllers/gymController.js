const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { getCoordinates } = require("../services/geoservice");
const { generatePassword } = require("../utils/passwordGen");
const Statistiques = require("../models/statistiques");
const Gymdes = require("../models/GymDescription");
const User = require("../models/User");

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
    const { gymId, userId: targetUserId } = req.params;
    const { userId: bodyUserId } = req.body; // Alternative way to pass userId
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
    const requesterId = decoded.Oid;

    // Determine the user to remove from gym
    const userToRemove = targetUserId || bodyUserId || requesterId;

    // Check if this is a kick operation (removing someone else)
    const isKickOperation = userToRemove !== requesterId;

    if (isKickOperation) {
      // Only gym owner can kick members
      if (check.owner.toString() !== requesterId) {
        logger.warn(
          `User ${requesterId} attempted to kick user ${userToRemove} from gym ${gymId} without permission`
        );
        return res
          .status(403)
          .json({ message: "Only gym owners can kick members" });
      }
      logger.info(
        `Gym owner ${requesterId} is kicking user ${userToRemove} from gym ${gymId}`
      );
    } else {
      logger.info(`User ${userToRemove} is leaving gym ${gymId}`);
    }

    const result = await User.findByIdAndUpdate(
      userToRemove,
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
      (member) => member.toString() !== userToRemove
    );
    statistics.totalMembers -= 1;
    await statistics.save();

    if (isKickOperation) {
      logger.info(
        `User ${userToRemove} has been kicked from gym ${gymId} by owner ${requesterId}`
      );
      res.status(200).json({
        message: "Member kicked successfully",
        kickedUserId: userToRemove,
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changegymname = async (req, res) => {
  try {
    const { gymid } = req.params;
    const { newname } = req.body;
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized attempt to changename for gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const mygym = await Gym.findById(gymid);

    if (!mygym) {
      return res.status(404).json({ message: "gym not found" });
    }

    // Check if the user is the owner of this gym
    if (mygym.owner.toString() !== userId) {
      logger.warn(
        `User ${userId} attempted to edit gym ${gymid} without permission`
      );
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this gym" });
    }

    if (!newname || newname.trim().length === 0) {
      return res.status(400).json({ message: "Gym name cannot be empty" });
    }

    mygym.name = newname.trim();
    await mygym.save();
    res.status(200).json({ message: "gym name changed!" });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changegymemail = async (req, res) => {
  try {
    const { gymid } = req.params;
    const { newemail } = req.body;
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized attempt to change email for gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const mygym = await Gym.findById(gymid);

    if (!mygym) {
      return res.status(404).json({ message: "gym not found" });
    }

    // Check if the user is the owner of this gym
    if (mygym.owner.toString() !== userId) {
      logger.warn(
        `User ${userId} attempted to edit gym ${gymid} without permission`
      );
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this gym" });
    }

    if (!newemail || !newemail.includes("@")) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    mygym.contact.email = newemail.trim();
    await mygym.save();
    res.status(200).json({ message: "gym email changed!" });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changegymphone = async (req, res) => {
  try {
    const { gymid } = req.params;
    const { newphone } = req.body;
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized attempt to change phone for gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const mygym = await Gym.findById(gymid);

    if (!mygym) {
      return res.status(404).json({ message: "gym not found" });
    }

    // Check if the user is the owner of this gym
    if (mygym.owner.toString() !== userId) {
      logger.warn(
        `User ${userId} attempted to edit gym ${gymid} without permission`
      );
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this gym" });
    }

    if (!newphone || newphone.trim().length === 0) {
      return res.status(400).json({ message: "Phone number cannot be empty" });
    }

    mygym.contact.phonenumber = newphone.trim();
    await mygym.save();
    res.status(200).json({ message: "gym phone changed!" });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changegympriceBymounth = async (req, res) => {
  try {
    const { gymid } = req.params;
    const { newprice } = req.body;
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized attempt to change price for gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const mygym = await Gym.findById(gymid);

    if (!mygym) {
      return res.status(404).json({ message: "gym not found" });
    }

    // Check if the user is the owner of this gym
    if (mygym.owner.toString() !== userId) {
      logger.warn(
        `User ${userId} attempted to edit gym ${gymid} without permission`
      );
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this gym" });
    }

    if (!newprice || newprice < 0) {
      return res.status(400).json({ message: "Please provide a valid price" });
    }

    mygym.pricePerMonth = newprice;

    await mygym.save();
    res.status(200).json({ message: "gym price changed!" });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changegympass = async (req, res) => {
  try {
    const { gymid } = req.params;
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized attempt to change password for gym");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const mygym = await Gym.findById(gymid);

    if (!mygym) {
      return res.status(404).json({ message: "gym not found" });
    }

    // Check if the user is the owner of this gym
    if (mygym.owner.toString() !== userId) {
      logger.warn(
        `User ${userId} attempted to edit gym ${gymid} without permission`
      );
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this gym" });
    }

    const newpass = generatePassword(13);
    mygym.Secretpass = newpass;

    await mygym.save();
    res
      .status(200)
      .json({ message: "gym password changed!", newPassword: newpass });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
