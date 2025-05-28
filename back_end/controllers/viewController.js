const path = require("path");
const fs = require("fs");
const Gym = require("../models/Gyms");
const User = require("../models/User");
const statistiques = require("../models/statistiques");
const mongoose = require("mongoose");
const Membership = require("../models/membership");
const jwt = require("jsonwebtoken");
const Announcement = require("../models/Announcement");

exports.serveHome = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.sendFile(
      path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
    );
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(403)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }
    const user = await User.findById(decoded.Oid);
    const gyms = await Gym.find();
    const role = req.user.role;
    const toptrendingGyms = await Gym.find()
      .sort({ "reviews.totalreviews": -1 })
      .limit(4);
    const topstarsGyms = await Gym.find()
      .sort({ "reviews.totalstars": -1 })
      .limit(4);

    const joinedGyms = user.Gymsjoined || [];
    const announcements = await Announcement.find({ gym: { $in: joinedGyms } })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.render("home-user", {
      gyms,
      topstarsGyms,
      toptrendingGyms,
      role,
      username: decoded.username,
      LA: announcements,
    });
  } catch (err) {
    console.error("Error fetching gyms:", err);
    return res
      .status(500)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
};

exports.serveGymPage = async (req, res) => {
  const { id, thing } = req.params;
  let file = "";
  let token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html"));
  }
  let decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
  console.log("Requested gym page:", { id, thing });

  if (id && !thing) {
    try {
      const gym = await Gym.findById(id);
      const stats = await statistiques.findById(gym.statistiques);
      if (!gym || !stats) {
        return res
          .status(500)
          .sendFile(
            path.resolve(__dirname, "../../front_end/pages/error.html")
          );
      }
      stats.newSignUps = stats.newSignUps + 1;
      await stats.save();
      let memberships = await Membership.find({ userId: decoded.Oid }).sort({
        requestedAt: -1,
      });
      if (memberships.length > 0 && memberships[0].status === "approved") {
        memberships = memberships[0];
      }
      const date = new Date(memberships.requestedAt);
      const formatted = date.toLocaleString(); // e.g., "5/28/2025, 11:11:57 PM"
      memberships.requestedAt = formatted;
      res.render("Gym", { gym, memberships });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  } else if (thing === "join" && id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }

    try {
      const gym = await Gym.findById(id);
      if (!gym) {
        console.warn("Gym not found with ID:", id);
        return res
          .status(404)
          .sendFile(
            path.resolve(__dirname, "../../front_end/pages/error.html")
          );
      }

      file = "joinGym.html";
    } catch (err) {
      console.error("Database error fetching gym:", err);
      return res
        .status(500)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }
  } else if (thing === "scanqrcode" && id) {
    file = "scanqrcode.html";
  } else {
    if (thing === "reviews" && id) {
      file = "reviews.html";
    } else {
      if (thing == "annoucements" && id) {
        file = "annoucements.html";
      } else {
        return res
          .status(404)
          .sendFile(
            path.resolve(__dirname, "../../front_end/pages/error.html")
          );
      }
    }
  }

  res.sendFile(
    path.resolve(__dirname, `../../front_end/pages/Gympages/${file}`)
  );
};

exports.servePage = (page) => async (req, res) => {
  const filePath = path.resolve(
    __dirname,
    `../../front_end/pages/Homepages/${page}`
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res
        .status(404)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }
    res.sendFile(filePath);
  });
};

exports.handleNotFound = (req, res) => {
  res
    .status(404)
    .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
};

exports.serveowner = async (req, res) => {
  const thing = req.params.thing; // e.g. "members"
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .sendFile(
        path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
      );

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }

  if (decoded.role !== "owner")
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));

  const user = await User.findById(decoded.Oid);
  const joinedGyms = user.Gymsjoined || [];
  const announcements = await Announcement.find({ gym: { $in: joinedGyms } })
    .sort({ createdAt: -1 })
    .limit(5);
  if (!user || !user.Gymowned)
    return res
      .status(404)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));

  const gym = await Gym.findById(user.Gymowned);
  if (!gym)
    return res
      .status(404)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));

  if (thing === "members") {
    const memberships = await Membership.find({ gymId: gym._id });
     const gymWithStats = await Gym.findById(gym._id).populate({
      path: 'statistiques',
      populate: {
        path: 'members',
        model: 'User',
        select: 'username email role' // Select only needed fields
      }
    });
    
    const members = gymWithStats.statistiques.members || [];
    return res.render("members", {
      role: decoded.role,
      gym,
      memberships,
      username: decoded.username,
      LA: announcements,
      members: members || [],
    });
  }

  // other owner pages:
  return res.render(thing, {
    role: decoded.role,
    gym,
    username: decoded.username,
    LA: announcements,
  });
};
exports.serveSettings = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .sendFile(
        path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
      );
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }

  const user = await User.findById(decoded.Oid);

  const joinedGyms = user.Gymsjoined || [];
  const announcements = await Announcement.find({ gym: { $in: joinedGyms } })
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("settings", {
    role: decoded.role,
    username: decoded.username,
    email: user.email,
    LA: announcements,
  });
};
exports.serveSearch = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .sendFile(
        path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
      );
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
  const user = await User.findById(decoded.Oid);
  const joinedGyms = user.Gymsjoined || [];
  const announcements = await Announcement.find({ gym: { $in: joinedGyms } })
    .sort({ createdAt: -1 })
    .limit(5);
  let search_query = req.query.search_query;
  let Gyms;
  if (!search_query) {
    Gyms = [];
  } else {
    Gyms = await Gym.find({
      name: { $regex: search_query, $options: "i" }, // 'i' for case-insensitive
    });
  }

  res.render("search", {
    role: decoded.role,
    username: decoded.username,
    gyms: Gyms,
    LA: announcements,
  });
};
exports.serveDashboard = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .sendFile(
        path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
      );
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(403)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
  let owner = await User.findById(decoded.Oid);
  let gym = await Gym.findById(owner.Gymowned);
  let stats = await statistiques.findById(gym.statistiques);
  if (!gym || !owner) {
    return res
      .status(404)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
  const joinedGyms = owner.Gymsjoined || [];
  const announcements = await Announcement.find({ gym: { $in: joinedGyms } })
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("dashboard", {
    role: decoded.role,
    username: decoded.username,
    gym,
    stats,
    LA: announcements,
  });
};
