const Checkin = require("../models/checkin");
const Gym = require("../models/Gyms");
const User = require("../models/User");
const statistiques = require("../models/statistiques");

exports.handleCheckin = async (req, res) => {
  try {
    const { memberId, gymId } = req.body;

    const match = memberId.match(/user_id:([a-fA-F0-9]{24})-/);
    if (!match) {
      return res.status(400).json({ message: "Invalid QR code data format" });
    }

    const userId = match[1];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }
    const stat = await statistiques.findById(gym.statistiques);
    const isJoined = user.Gymsjoined.some(
      (joinedGymId) => joinedGymId.toString() === gymId.toString()
    );

    if (!isJoined) {
      stat.checkInsHistory.push({
        userId: user._id,
        checkInTime: new Date(),
        status: false,
      });
      await stat.save();
      return res.status(403).json({ message: "User has not joined this gym" });
    }

    // Validate gym exists
    if (stat) {
      stat.dailyCheckIns += 1;
      stat.checkInsHistory.push({
        userId: user._id,
        checkInTime: new Date(),
        status: true,
      });
      await stat.save();
    }

    res.status(200).json({ message: "Check-in successful" });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
