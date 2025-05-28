const Checkin = require("../models/checkin");
const Gym = require("../models/Gyms");
const User = require("../models/User");

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

    
    const isJoined = user.Gymsjoined.some(joinedGymId =>
      joinedGymId.toString() === gymId.toString()
    );

    if (!isJoined) {
      return res.status(403).json({ message: "User has not joined this gym" });
    }

    // Validate gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

   
    gym.statistiques.dailyCheckIns += 1;
    await gym.save();

   


    res.status(200).json({ message: "Check-in successful" });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
