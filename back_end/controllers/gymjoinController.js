const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gym = require("../models/Gyms");
const Statistiques = require("../models/statistiques");
const Membership = require("../models/membership");

exports.sendrequest = async (req, res) => {
  const { fullName, description, gymId, password } = req.body;
  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    if (!fullName || !gymId || !password) {
      return res
        .status(400)
        .json({ error: "Full name, password, and gym ID are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found." });

    if (password !== gym.Secretpass) {
      return res.status(403).json({ error: "Incorrect gym password." });
    }

    if (user.Gymsjoined.includes(gym._id)) {
      return res.status(400).json({ error: "You already joined this gym." });
    }
    if (gym.owner.equals(userId)) {
      return res.status(400).json({ error: "You already own this gym." });
    }

    const existingPendingRequest = await Membership.findOne({
      userId: userId,
      gymId: gymId,
      status: "pending",
    });

    if (existingPendingRequest) {
      return res
        .status(400)
        .json({ error: "You already have a pending membership request for this gym." });
    }

    const newReq = new Membership({ userId, gymId, fullName, description, status: "pending" });
    await newReq.save();

    res.status(200).json({ message: "Request sent successfully!" });
  } catch (err) {
    console.error("❌ Error in sendrequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};


exports.acceptRequest = async (req, res) => {
  const { fullName, gymId, password, userId } = req.body;
  console.log(fullName, gymId, password, userId);

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!fullName || !gymId || !password || !userId) {
      return res
        .status(400)
        .json({ error: "fullName, gymId, password and userId are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found." });

    if (password != gym.Secretpass) {
      return res.status(404).json({ error: "wrong password :}." });
    }

    // add gym to user
    user.Gymsjoined.push(gym._id);
    await user.save();

    // update statistics
    if (gym.statistiques) {
      const stats = await Statistiques.findById(gym.statistiques);
      if (stats && !stats.members.includes(user._id)) {
        stats.members.push(user._id);
        stats.totalMembers++;
        stats.newSignUps++;
        stats.newMembers++;
        await stats.save();
      }
    }

    // update membership request
    const request = await Membership.findOne({ userId, gymId, fullName });
    if (request) {
      request.status = "approved";
      await request.save();
    }

    res.status(200).json({ message: "Membership approved!" });
  } catch (err) {
    console.error("❌ Error in acceptRequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.declinerequest = async (req, res) => {
  const { fullName, gymId, userId } = req.body;
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!fullName || !gymId || !userId) {
      return res
        .status(400)
        .json({ error: "fullName, gymId and userId are required." });
    }

    // remove the membership request (not the user!)
    const result = await Membership.findOneAndDelete({
      userId,
      gymId,
      fullName,
    });
    if (!result) {
      return res.status(404).json({ error: "Request not found." });
    }

    res.status(200).json({ message: "Request declined." });
  } catch (err) {
    console.error("❌ Error in declinerequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.getrequests = async (req, res) => {
  const { gymId } = req.body;
  try {
    if (!gymId) {
      return res.status(400).json({ error: "gymId is required." });
    }
    const requests = await Membership.find({ gymId });
    res.status(200).json({ requests });
  } catch (err) {
    console.error("❌ Error in getrequests:", err);
    res.status(500).json({ error: "Server error." });
  }
};
