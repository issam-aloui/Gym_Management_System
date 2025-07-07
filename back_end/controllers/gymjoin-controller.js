const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Gym = require("../models/gyms");
const Statistiques = require("../models/statistiques");
const Membership = require("../models/membership");
const { isPasswordMatch } = require("../utils/password-compare");
exports.sendrequest = async (request, response) => {
  const { fullName, description, gymId, password } = request.body;
  const token = request.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    if (!fullName || !gymId || !password) {
      return response
        .status(400)
        .json({ error: "Full name, password, and gym ID are required." });
    }

    const user = await User.findById(userId);
    if (!user) return response.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return response.status(404).json({ error: "Gym not found." });

    if (!isPasswordMatch(password, gym.Secretpass)) {
      return response.status(403).json({ error: "Incorrect gym password." });
    }

    if (user.Gymsjoined.includes(gym._id)) {
      return response
        .status(400)
        .json({ error: "You already joined this gym." });
    }
    if (gym.owner.equals(userId)) {
      return response.status(400).json({ error: "You already own this gym." });
    }

    const existingPendingRequest = await Membership.findOne({
      userId: userId,
      gymId: gymId,
      status: "pending",
    });

    if (existingPendingRequest) {
      return response.status(400).json({
        error: "You already have a pending membership request for this gym.",
      });
    }

    const newRequest = new Membership({
      userId,
      gymId,
      fullName,
      description,
      status: "pending",
    });
    await newRequest.save();

    response.status(200).json({ message: "Request sent successfully!" });
  } catch (error) {
    console.error("❌ Error in sendrequest:", error);
    response.status(500).json({ error: "Server error." });
  }
};

exports.acceptRequest = async (request, response) => {
  const { fullName, gymId, password, userId } = request.body;
  console.log(fullName, gymId, password, userId);

  const token = request.cookies.token;

  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!fullName || !gymId || !password || !userId) {
      return response
        .status(400)
        .json({ error: "fullName, gymId, password and userId are required." });
    }

    const user = await User.findById(userId);
    if (!user) return response.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return response.status(404).json({ error: "Gym not found." });

    if (!isPasswordMatch(password, gym.Secretpass)) {
      return response.status(404).json({ error: "wrong password :}." });
    }

    // add gym to user
    user.Gymsjoined.push(gym._id);
    await user.save();
    try {
      // update statistics
      if (gym.statistiques) {
        const stats = await Statistiques.findById(gym.statistiques);
        if (stats && !stats.members.includes(user._id)) {
          stats.members.push(user._id);
          stats.totalMembers++;
          stats.newSignUps++;
          stats.newMembers++;
          stats.monthlyRevenue += gym.pricePerMonth; // Assuming pricePerMonth is defined in Gym model
          stats.TotalRevenue += gym.pricePerMonth; // Assuming TotalRevenue is defined in Statistiques model
          await stats.save();
        }
      }
    } catch (error) {
      console.error("❌ Error updating statistics:", error);
      return response.status(500).json({ error: "Error updating statistics." });
    }

    // update membership request
    const request = await Membership.findOne({ userId, gymId, fullName });
    if (request) {
      request.status = "approved";
      await request.save();
    }

    response.status(200).json({ message: "Membership approved!" });
  } catch (error) {
    console.error("❌ Error in acceptRequest:", error);
    response.status(500).json({ error: "Server error." });
  }
};

exports.declinerequest = async (request, response) => {
  const { fullName, gymId, userId } = request.body;
  const token = request.cookies.token;

  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!fullName || !gymId || !userId) {
      return response
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
      return response.status(404).json({ error: "Request not found." });
    }

    response.status(200).json({ message: "Request declined." });
  } catch (error) {
    console.error("❌ Error in declinerequest:", error);
    response.status(500).json({ error: "Server error." });
  }
};

exports.getrequests = async (request, response) => {
  const { gymId } = request.body;
  try {
    if (!gymId) {
      return response.status(400).json({ error: "gymId is required." });
    }
    const requests = await Membership.find({ gymId });
    response.status(200).json({ requests });
  } catch (error) {
    console.error("❌ Error in getrequests:", error);
    response.status(500).json({ error: "Server error." });
  }
};
