const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gyms');
const Statistiques = require('../models/statistiques');


exports.createMembershipRequest = async (req, res) => {
  
  const { fullName, description, gymId, password } = req.body;
  const token = req.cookies.token;

  if (!token) {
    logger.warn("Unauthorized attempt to create a gym");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!fullName || !gymId || !password) {
      return res.status(400).json({ error: 'Full name, password, and gym ID are required.' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: 'Gym not found.' });

    if (password !== gym.Secretpass) {
      return res.status(403).json({ error: 'Incorrect gym password.' });
    }

    if (user.Gymsjoined.includes(gym._id)) {
      return res.status(400).json({ error: 'You already joined this gym.' });
    }

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

    res.status(200).json({ message: 'You joined the gym successfully!' });

  } catch (err) {
    console.error("❌ Error in createMembershipRequest:", err);
    res.status(500).json({ error: 'Server error.' });
  }
};
