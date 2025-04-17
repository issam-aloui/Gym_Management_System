const jwt = require("jsonwebtoken");
const Checkin = require("../models/checkin");
const Gym = require("../models/Gyms");

exports.handleCheckin = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { gymId } = req.query;

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    const checkin = new Checkin({ user: userId, gym: gym._id });
    await checkin.save();

    res.status(200).json({ message: "Check-in successful", checkin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};