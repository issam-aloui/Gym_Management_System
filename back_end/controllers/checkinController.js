const jwt = require("jsonwebtoken");
const Checkin = require("../models/checkin");
const Gym = require("../models/Gyms");
const User = require("../models/User");

exports.handleCheckin = async (req, res) => {
  try {
    const { memberId, gymId } = req.body;

    // Extract the user ID using regex
    const match = memberId.match(/user_id:([\w\d]+)-/);
    if (!match) {
      return res.status(400).json({ message: "Invalid QR code data format" });
    }

    const userId = match[1]; 

 
    const checkin = new Checkin({ user: userId, gym: gymId });
    await checkin.save();

    res.status(200).json({ message: "Check-in successful", checkin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

