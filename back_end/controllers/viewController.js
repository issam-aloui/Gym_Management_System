const path = require("path");
const fs = require("fs");
const Gym = require("../models/Gyms");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

exports.serveHome = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.sendFile(
      path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
    );
  }

  try {
    const gyms = await Gym.find();
    const role = req.user.role;
    const toptrendingGyms = await Gym.find()
      .sort({ "reviews.totalreviews": -1 })
      .limit(4);
    const topstarsGyms = await Gym.find()
      .sort({ "reviews.totalstars": -1 })
      .limit(4);

    return res.render("home-user", { gyms, topstarsGyms, toptrendingGyms, role });
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

  console.log("Requested gym page:", { id, thing });

  if (id && !thing) {
    try {
      const gym = await Gym.findById(id);
      if (!gym) {
        return res
          .status(500)
          .sendFile(
            path.resolve(__dirname, "../../front_end/pages/error.html")
          );
      }
      res.render("Gym", { gym });
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
      return res
        .status(404)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
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
  let { thing } = req.params;
  const token = req.cookies.token;

  if (!thing.endsWith(".html")) {
    thing += ".html";
  }

  if (!token) {
    return res.status(404).sendFile(
      path.resolve(__dirname, "../../front_end/pages/Homepages/ad.html")
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).sendFile(
      path.resolve(__dirname, "../../front_end/pages/error.html")
    );
  }

  if (decoded.role !== "owner") {
    return res.status(403).sendFile(
      path.resolve(__dirname, "../../front_end/pages/error.html")
    );
  }

  const filePath = path.resolve(__dirname, `../../front_end/pages/Ownerpages/${thing}`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).sendFile(
        path.resolve(__dirname, "../../front_end/pages/error.html")
      );
    }
    res.sendFile(filePath);
  });
};