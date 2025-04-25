const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gym = require("../models/Gyms");
const Statistiques = require("../models/statistiques");
const membership = require("../models/membership");

exports.sendrequest = async (req, res) => {
  const { fullName, descreption, gymId, password } = req.body;
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
    if (gym.owner == userId) {
      return res.status(400).json({ error: "You already own this gym." });
    }

    const newReq = new membership({ userId, gymId, fullName, descreption });
    await newReq.save();

    return res.status(200).json({ message: "request sent succefully !" });
  } catch (err) {
    console.error("❌ Error in MembershipRequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.acceptRequest = async (req, res) => {
  const { fullName, gymId, password, userId} = req.body; 
  const token = req.cookies.token;

  if (!token) {
    logger.warn("Unauthorized attempt to create a gym");
    return res.status(401).json({ message: "Unauthorized" });
  }

 

  try {
    if (!fullName || !gymId || !password) {
      return res
        .status(400)
        .json({ error: "Full name, password, and gym ID are required." });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found." });

    user.Gymsjoined.push(gym._id);
    await user.save();

    if (gym.statistiques) {
      const stats = await Statistiques.findById(gym.statistiques);

      if (stats && !stats.members.includes(user._id)) {
        stats.members.push(user._id);
        stats.totalMembers += 1;
        stats.newSignUps += 1;
        await stats.save();
      }
    }

    const request = membership.findOne({ userId, gymId, fullName });
    request.status = "approved";
    await request.save();

    res.status(200).json({ message: "You joined the gym successfully!" });
  } catch (err) {
    console.error("❌ Error in createMembershipRequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.declinerequest = async (req, res) => {
  const { fullName, gymId, userId } = req.body;
  const token = req.cookies.token;

  if (!token) {
    logger.warn("Unauthorized attempt to create a gym");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if (!fullName || !gymId) {
      return res
        .status(400)
        .json({ error: "Full name, password, and gym ID are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found." });

    const request = await membership.findOne({ userId, gymId, fullName });

    if (!request) {
      return res.status(401).json({ message: "something went wrong" });
    }

    await User.deleteOne(request._id);

    res.status(200).json({ message: "You joined the gym successfully!" });
  } catch (err) {
    console.error("❌ Error in createMembershipRequest:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.getrequests = async (req,res)=>{
  const {gymId} = req.body;
  
  try {
  const gyms = membership.find({gymId});
 
   if (!gyms) {
    res.status(400).json({message:"no requests or members approved for this gym"});
   }

  res.status(200).json({gyms});
  }
  catch(err) {
    res.status(500).json({ error: "Server error." });
  }

}