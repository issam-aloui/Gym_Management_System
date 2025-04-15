const jwt = require('jsonwebtoken');
const MembershipRequest = require('../models/membership');
const User = require('../models/User');
const Gym = require('../models/Gyms'); // Don't forget to import Gym model

// POST: Create new membership request
exports.createMembershipRequest = async (req, res) => {
  const { fullName, description, gymId } = req.body;

  if (!fullName || !gymId) {
    return res.status(400).json({ error: 'Full name and gym ID are required.' });
  }

  try {

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const gym = await Gym.findOne({ id: gymId });
    if (!gym) return res.status(404).json({ error: 'Gym not found.' });


    const existing = await MembershipRequest.findOne({
      userId: user._id,
      gymId: gym._id
    });
    if (existing) {
      return res.status(400).json({ error: 'You already sent a request to this gym.' });
    }

    // 4. Save request with proper ObjectIds
    const request = new MembershipRequest({
      userId: user._id,
      gymId: gym._id,
      fullName,
      description: description || ''
    });

    await request.save();
    res.status(201).json({ message: 'Membership request sent.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};
